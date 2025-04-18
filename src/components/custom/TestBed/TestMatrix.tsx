"use client"

import { useState } from "react"
import { 
  useProjectRequirements, 
  useRequirementsByIds 
} from "@/hooks/queries/useRequirement"
import {
  useProjectTestCases,
  useProjectRequirementTests,
  useCreateTestReq,
  useCreateRequirementTest
} from "@/components/custom/TestBed/useTestReq"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Database } from "@/types/base/database.types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase/supabaseBrowser"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/constants/queryKeys"

interface TraceabilityMatrixViewProps {
  projectId: string
}

type TestData = {
  title: string;
  description: string;
  test_type: Database['public']['Enums']['test_type'];
  method: Database['public']['Enums']['test_method'];
  priority: Database['public']['Enums']['test_priority'];
  status: Database['public']['Enums']['test_status'];
}

// Add new type for execution status
type ExecutionStatus = Database['public']['Enums']['execution_status']

export default function TraceabilityMatrixView({
  projectId
}: TraceabilityMatrixViewProps) {
  const [selectedRequirementIds, setSelectedRequirementIds] = useState<string[]>([])
  const [showAddRequirementModal, setShowAddRequirementModal] = useState(false)
  const [showAddTestModal, setShowAddTestModal] = useState(false)
  const [currentRequirementId, setCurrentRequirementId] = useState<string | null>(null)
  const [newTestData, setNewTestData] = useState<TestData>({
    title: "",
    description: "",
    test_type: "unit",
    method: "manual",
    priority: "medium",
    status: "draft"
  })

  const queryClient = useQueryClient()

  // Fetch requirements for this project
  const { data: allRequirements = [] } = useProjectRequirements(projectId)

  // Fetch requirements that should be displayed in the matrix
  const { data: requirements = [] } = useRequirementsByIds(selectedRequirementIds.length > 0 
    ? selectedRequirementIds 
    : allRequirements.slice(0, 10).map(req => req.id))

  // Fetch all test cases for this project
  const { data: testCasesData, isLoading: testCasesLoading } = useProjectTestCases(projectId)
  const testCases = testCasesData?.data || []

  // Fetch all requirement-test relationships
  const { data: requirementTests = [] } = useProjectRequirementTests(projectId)

  // Mutations
  const createTestReq = useCreateTestReq()
  const createRequirementTest = useCreateRequirementTest()

  // Add mutation for updating test status
  const updateTestStatus = async (requirementId: string, testId: string, status: ExecutionStatus) => {
    try {
      const { data, error } = await supabase
        .from('requirement_tests')
        .update({ execution_status: status })
        .eq('requirement_id', requirementId)
        .eq('test_id', testId)
        .select()
        .single()

      if (error) throw error
      
      // Refetch requirement tests to update the UI
      await queryClient.invalidateQueries({
        queryKey: [...queryKeys.requirementTests.list, projectId]
      })
    } catch (error) {
      console.error("Error updating test status:", error)
    }
  }

  // Function to determine the status of a requirement-test relationship
  const getRelationshipStatus = (reqId: string, testId: string) => {
    const relationship = requirementTests.find(
      (rt) => rt.requirementId === reqId && rt.testCaseId === testId
    )

    if (!relationship) return null
    return relationship.status
  }

  // Handle creating a new test and linking to requirement
  const handleCreateTest = async () => {
    if (!currentRequirementId) return

    try {
      const newTest = await createTestReq.mutateAsync({
        ...newTestData,
        project_id: projectId,
        is_active: true
      })

      await createRequirementTest.mutateAsync({
        requirement_id: currentRequirementId,
        test_id: newTest.id,
        execution_status: 'not_executed'
      })

      setShowAddTestModal(false)
      setNewTestData({
        title: "",
        description: "",
        test_type: "unit",
        method: "manual",
        priority: "medium",
        status: "draft"
      })
    } catch (error) {
      console.error("Error creating test:", error)
    }
  }

  // Handle linking an existing test to a requirement
  const handleLinkTest = async (requirementId: string, testId: string) => {
    try {
      await createRequirementTest.mutateAsync({
        requirement_id: requirementId,
        test_id: testId,
        execution_status: 'not_executed'
      })
    } catch (error) {
      console.error("Error linking test:", error)
    }
  }

  // Update selected requirements for the matrix
  const handleRequirementsSelected = (selectedIds: string[]) => {
    setSelectedRequirementIds(selectedIds)
    setShowAddRequirementModal(false)
  }

  if (testCasesLoading) {
    return <div className="p-6 text-center">Loading traceability matrix...</div>
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-medium">Requirements Traceability Matrix</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowAddRequirementModal(true)}
            variant="outline"
          >
            Manage Requirements
          </Button>
        </div>
      </div>

      {requirements.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500 mb-4">No requirements selected for the traceability matrix</p>
          <Button onClick={() => setShowAddRequirementModal(true)}>
            Add Requirements
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-y bg-gray-50">
                <th className="py-4 px-4 text-left font-medium border-r">Req ID</th>
                <th className="py-4 px-4 text-left font-medium border-r">Type</th>
                <th className="py-4 px-4 text-left font-medium border-r">Title</th>
                {testCases.map((testCase) => (
                  <th key={testCase.id} className="py-4 px-4 text-center font-medium border-r min-w-[120px]">
                    {testCase.test_id || 'NULL-ID'}
                  </th>
                ))}
                <th className="py-4 px-4 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((requirement) => (
                <tr key={requirement.id} className="border-t hover:bg-gray-50">
                  <td className="py-4 px-4 border-r">{requirement.external_id || requirement.id.substring(0, 8)}</td>
                  <td className="py-4 px-4 border-r">{requirement.level}</td>
                  <td className="py-4 px-4 border-r">{requirement.name}</td>
                  {testCases.map((testCase) => {
                    const relationship = requirementTests.find(
                      (rt) => rt.requirementId === requirement.id && rt.testCaseId === testCase.id
                    )
                    const status = relationship?.status
                    const executionStatus = relationship?.execution_status as ExecutionStatus | undefined

                    return (
                      <td key={`${requirement.id}-${testCase.id}`} className="py-4 px-4 text-center border-r">
                        {relationship ? (
                          <Select
                            value={executionStatus || 'not_executed'}
                            onValueChange={(value: ExecutionStatus) => 
                              updateTestStatus(requirement.id, testCase.id, value)
                            }
                          >
                            <SelectTrigger className="w-[130px] mx-auto">
                              <SelectValue>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className={`w-3 h-3 rounded-full ${
                                      executionStatus === 'passed' ? 'bg-green-500' :
                                      executionStatus === 'failed' ? 'bg-red-500' :
                                      executionStatus === 'blocked' ? 'bg-yellow-500' :
                                      executionStatus === 'in_progress' ? 'bg-blue-500' :
                                      executionStatus === 'skipped' ? 'bg-gray-400' :
                                      'bg-gray-300'
                                    }`}
                                  />
                                  <span className="capitalize">
                                    {(executionStatus || 'not_executed').replace('_', ' ')}
                                  </span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_executed">Not Executed</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="passed">Passed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                              <SelectItem value="skipped">Skipped</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <button 
                            onClick={() => handleLinkTest(requirement.id, testCase.id)}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Link
                          </button>
                        )}
                      </td>
                    )
                  })}
                  <td className="py-4 px-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCurrentRequirementId(requirement.id)
                        setShowAddTestModal(true)
                      }}
                    >
                      Add Test
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Requirement Modal */}
      <Dialog open={showAddRequirementModal} onOpenChange={setShowAddRequirementModal}>
        <DialogContent>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Select Requirements</h3>
            <div className="max-h-96 overflow-y-auto mb-4">
              {allRequirements?.map(req => (
                <div key={req.id} className="flex items-center space-x-2 mb-2 p-2 hover:bg-gray-100 rounded">
                  <Checkbox
                    id={req.id}
                    checked={selectedRequirementIds.includes(req.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRequirementIds(prev => [...prev, req.id])
                      } else {
                        setSelectedRequirementIds(prev => prev.filter(id => id !== req.id))
                      }
                    }}
                  />
                  <label htmlFor={req.id} className="text-sm cursor-pointer flex-1">
                    <div className="font-medium">{req.name}</div>
                    <div className="text-xs text-gray-500">{req.level} • {req.id.substring(0, 8)}</div>
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddRequirementModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleRequirementsSelected(selectedRequirementIds)}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Test Modal */}
      <Dialog open={showAddTestModal} onOpenChange={setShowAddTestModal}>
        <DialogContent>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Add Test Case</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={newTestData.title}
                  onChange={(e) => setNewTestData({...newTestData, title: e.target.value})}
                  placeholder="Test case title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={newTestData.description}
                  onChange={(e) => setNewTestData({...newTestData, description: e.target.value})}
                  placeholder="Test case description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={newTestData.test_type}
                    onChange={(e) => setNewTestData({...newTestData, test_type: e.target.value as Database['public']['Enums']['test_type']})}
                  >
                    <option value="unit">Unit</option>
                    <option value="integration">Integration</option>
                    <option value="system">System</option>
                    <option value="acceptance">Acceptance</option>
                    <option value="performance">Performance</option>
                    <option value="security">Security</option>
                    <option value="usability">Usability</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Method</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={newTestData.method}
                    onChange={(e) => setNewTestData({...newTestData, method: e.target.value as Database['public']['Enums']['test_method']})}
                  >
                    <option value="manual">Manual</option>
                    <option value="automated">Automated</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={newTestData.priority}
                    onChange={(e) => setNewTestData({...newTestData, priority: e.target.value as Database['public']['Enums']['test_priority']})}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={newTestData.status}
                    onChange={(e) => setNewTestData({...newTestData, status: e.target.value as Database['public']['Enums']['test_status']})}
                  >
                    <option value="draft">Draft</option>
                    <option value="ready">Ready</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                    <option value="obsolete">Obsolete</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Link Existing Test</h4>
              <select
                className="w-full p-2 border rounded mb-4"
                onChange={(e) => {
                  if (e.target.value && currentRequirementId) {
                    handleLinkTest(currentRequirementId, e.target.value);
                    setShowAddTestModal(false);
                  }
                }}
              >
                <option value="">Select an existing test...</option>
                {testCases
                  .filter(test => {
                    // Filter out tests that are already linked to this requirement
                    return !requirementTests.some(rt => 
                      rt.requirementId === currentRequirementId && rt.testCaseId === test.id
                    );
                  })
                  .map(test => (
                    <option key={test.id} value={test.id}>
                      {test.name}
                    </option>
                  ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowAddTestModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTest}
                disabled={!newTestData.title || createTestReq.isPending}
              >
                {createTestReq.isPending ? 'Creating...' : 'Create New Test'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}