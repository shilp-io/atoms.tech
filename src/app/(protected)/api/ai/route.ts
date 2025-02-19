import { NextRequest, NextResponse } from 'next/server';
import { gumloopService } from '@/lib/services/gumloop';
// import { rateLimit } from '@/lib/middleware/rateLimit';

type ActionType = 'startPipeline' | 'getPipelineStatus';

interface BaseRequest {
    action: ActionType;
}

interface StartPipelineRequest extends BaseRequest {
    action: 'startPipeline';
    requirement: string;
    fileNames?: string[] | string;
    systemName?: string;
    objective?: string;
    pipelineType: 'file-processing' | 'requirement-analysis';
    pipelineInputs?: Array<{ input_name: string; value: string }>;
}

interface GetPipelineStatusRequest extends BaseRequest {
    action: 'getPipelineStatus';
    runId: string;
}

type ApiRequest = StartPipelineRequest | GetPipelineStatusRequest;

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = (await request.json()) as ApiRequest;

        if (!body.action) {
            return NextResponse.json(
                { error: 'Action is required' },
                { status: 400 },
            );
        }

        switch (body.action) {
            case 'startPipeline': {
                const pipelineResponse = await gumloopService.startPipeline(
                    body.pipelineType,
                    body.requirement,
                    body.fileNames,
                    body.systemName,
                    body.objective,
                    body.pipelineInputs,
                );
                return NextResponse.json(pipelineResponse);
            }

            case 'getPipelineStatus': {
                const status = await gumloopService.getPipelineRun(body.runId);
                return NextResponse.json(status);
            }

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 },
                );
        }
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'An error occurred',
            },
            { status: 500 },
        );
    }
}

// GET method for pipeline status checks
export async function GET(request: NextRequest) {
    try {
        const runId = request.nextUrl.searchParams.get('runId');
        if (!runId) {
            return NextResponse.json(
                { error: 'Run ID is required' },
                { status: 400 },
            );
        }

        const status = await gumloopService.getPipelineRun(runId);
        return NextResponse.json(status);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'An error occurred',
            },
            { status: 500 },
        );
    }
}
