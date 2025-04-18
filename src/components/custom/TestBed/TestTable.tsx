"use client"

import { useState } from "react"
import { 
  useProjectTestCases, 
  useLinkedRequirementsCount
} from "@/components/custom/TestBed/useTestReq"
import Pagination from "@/components/custom/TestBed/pagination"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Database } from "@/types/base/database.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/supabaseBrowser"
import { queryKeys } from "@/lib/constants/queryKeys"
import { TestReq } from "@/components/custom/TestBed/types"

interface TestCaseViewProps {
  projectId: string
}

type TestData = {
  id?: string;
  title: string;
  description: string;
  test_type: Database['public']['Enums']['test_type'];
  method: Database['public']['Enums']['test_method'];
  priority: Database['public']['Enums']['test_priority'];
  status: Database['public']['Enums']['test_status'];
}

interface TestCaseRowProps {
  testCase: TestReq;
  getStatusStyle: (status: string) => string;
  getPriorityStyle: (priority: string) => string;
  onEdit: (testCase: TestReq) => void;
  onDelete: (id: string) => void;
}

function TestCaseRow({ 
  testCase,
  getStatusStyle,
  getPriorityStyle,
  onEdit,
  onDelete
}: TestCaseRowProps) {
  const { data: linkedCount = 0 } = useLinkedRequirementsCount(testCase.id || '')
  
  return (
    <tr className="border-t hover:bg-gray-50 cursor-pointer">
      <td className="py-4 px-4">{testCase.id?.substring(0, 6) || ''}</td>
      <td className="py-4 px-4">{testCase.title}</td>
      <td className="py-4 px-4">{testCase.test_type}</td>
      <td className="py-4 px-4">{testCase.method}</td>
      <td className="py-4 px-4">
        <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(testCase.status)}`}>
          {testCase.status.replace('_', ' ')}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className={getPriorityStyle(testCase.priority)}>
          {testCase.priority}
        </span>
      </td>
      <td className="py-4 px-4">
        {testCase.result === "Pass" && <span className="text-green-600">Pass</span>}
        {testCase.result === "Fail" && <span className="text-red-600">Fail</span>}
        {testCase.result === "Not Run" && <span>Not Run</span>}
      </td>
      <td className="py-4 px-4">{linkedCount}</td>
      <td className="py-4 px-4 text-center">
        <div className="flex space-x-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(testCase)
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(testCase.id || '')
            }}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  )
}

export default function TestCaseView({ projectId }: TestCaseViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [editingTest, setEditingTest] = useState<TestData | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [filters, setFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    search: ""
  })

  const queryClient = useQueryClient()

  // Fetch test cases with pagination
  const { 
    data: testCasesData, 
    isLoading, 
    error 
  } = useProjectTestCases(
    projectId,
    filters,
    { 
      page: currentPage, 
      pageSize, 
      orderBy: 'updated_at', 
      orderDirection: 'desc' 
    }
  )

  // Mutations
  const updateTestReq = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<TestReq> }) => {
      const { data, error } = await supabase
        .from('test_req')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as TestReq
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testReq.root })
      queryClient.invalidateQueries({ queryKey: queryKeys.testReq.byProject(data.project_id!) })
      queryClient.setQueryData(queryKeys.testReq.detail(data.id!), data)
    }
  })

  const deleteTestReq = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('test_req')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as TestReq
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testReq.root })
      queryClient.invalidateQueries({ queryKey: queryKeys.testReq.byProject(data.project_id!) })
    }
  })

  // Handle updating a test case
  const handleUpdateTest = async () => {
    if (!editingTest?.id) return
    
    try {
      await updateTestReq.mutateAsync({
        id: editingTest.id,
        updates: {
          title: editingTest.title,
          description: editingTest.description,
          test_type: editingTest.test_type,
          method: editingTest.method,
          status: editingTest.status,
          priority: editingTest.priority
        }
      })
      
      setShowEditModal(false)
      setEditingTest(null)
    } catch (error) {
      console.error("Error updating test case:", error)
    }
  }

  // Handle deleting a test case
  const handleDeleteTest = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this test case?")) {
      try {
        await deleteTestReq.mutateAsync(id)
      } catch (error) {
        console.error("Error deleting test case:", error)
      }
    }
  }

  // Helper functions to get status and priority styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'blocked':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-500'
      case 'medium':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  const handleEdit = (testCase: TestReq) => {
    setEditingTest({
      id: testCase.id,
      title: testCase.title,
      description: testCase.description || "",
      test_type: testCase.test_type,
      method: testCase.method,
      status: testCase.status,
      priority: testCase.priority
    })
    setShowEditModal(true)
  }

  if (isLoading) {
    return <div className="p-6 text-center">Loading test cases...</div>
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error loading test cases: {error.message}</div>
  }

  const testCases = testCasesData?.data || []
  const totalItems = testCasesData?.count || 0
  const totalPages = Math.ceil(totalItems / pageSize)

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="text-lg font-medium">Test Cases ({totalItems})</div>
        <div className="flex items-center space-x-4">
          <div>
            <select 
              className="p-2 border rounded"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search test cases..."
              className="p-2 border rounded w-64"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y bg-gray-50">
              <th className="py-4 px-4 text-left font-medium">Test ID</th>
              <th className="py-4 px-4 text-left font-medium">Title</th>
              <th className="py-4 px-4 text-left font-medium">Type</th>
              <th className="py-4 px-4 text-left font-medium">Method</th>
              <th className="py-4 px-4 text-left font-medium">Status</th>
              <th className="py-4 px-4 text-left font-medium">Priority</th>
              <th className="py-4 px-4 text-left font-medium">Result</th>
              <th className="py-4 px-4 text-left font-medium">Linked Reqs</th>
              <th className="py-4 px-4 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((testCase) => (
              <TestCaseRow 
                key={testCase.id} 
                testCase={testCase}
                getStatusStyle={getStatusStyle}
                getPriorityStyle={getPriorityStyle}
                onEdit={handleEdit}
                onDelete={handleDeleteTest}
              />
            ))}
            
            {testCases.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  No test cases found. Add some test cases to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />

      {/* Edit Test Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Edit Test Case</h3>
            
            {editingTest && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={editingTest.title}
                    onChange={(e) => setEditingTest({...editingTest, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={3}
                    value={editingTest.description}
                    onChange={(e) => setEditingTest({...editingTest, description: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={editingTest.test_type}
                      onChange={(e) => setEditingTest({...editingTest, test_type: e.target.value as Database['public']['Enums']['test_type']})}
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
                      value={editingTest.method}
                      onChange={(e) => setEditingTest({...editingTest, method: e.target.value as Database['public']['Enums']['test_method']})}
                    >
                      <option value="manual">Manual</option>
                      <option value="automated">Automated</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={editingTest.status}
                      onChange={(e) => setEditingTest({...editingTest, status: e.target.value as Database['public']['Enums']['test_status']})}
                    >
                      <option value="draft">Draft</option>
                      <option value="ready">Ready</option>
                      <option value="in_progress">In Progress</option>
                      <option value="blocked">Blocked</option>
                      <option value="completed">Completed</option>
                      <option value="obsolete">Obsolete</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={editingTest.priority}
                      onChange={(e) => setEditingTest({...editingTest, priority: e.target.value as Database['public']['Enums']['test_priority']})}
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateTest}
                disabled={updateTestReq.isPending}
              >
                {updateTestReq.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}