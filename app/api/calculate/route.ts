import { NextRequest, NextResponse } from 'next/server'
import { RiskCalculationRequest, RiskCalculationResponse } from '../../../shared/types/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.age || !body.sex) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: age, sex' },
        { status: 400 }
      )
    }

    // For now, call Python backend via HTTP
    // TODO: Implement direct Python integration or ensure Python server is running
    const pythonRequest: RiskCalculationRequest = {
      age: parseInt(body.age),
      sex: body.sex,
      race: body.race || 'white',
      risk_factors: body.risk_factors || {},
      time_horizon: body.time_horizon || '1_year'
    }

    try {
       // Try to call the Python backend
       const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
       const response = await fetch(`${backendUrl}/api/calculate-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pythonRequest),
      })

      if (response.ok) {
        const result = await response.json()
        return NextResponse.json(result)
      } else {
        throw new Error('Python backend not responding')
      }
    } catch (error) {
      // Fallback: Return a message indicating Python backend needs to be started
      console.warn('Python backend not available, returning setup instructions')
      return NextResponse.json({
        success: false,
        error: 'Python backend not running',
        instructions: {
          message: 'Please start the Python backend server',
           command: 'cd backend && python3 api/mortality_api.py',
           port: 5001
        },
        fallback_data: {
          lifeExpectancy: 0,
          oneYearMortality: 0,
          riskFactors: {},
          causesOfDeath: [],
          cardiovascularRisk: {
            risk_10_year: 0,
            risk_5_year: 0,
            risk_1_year: 0,
            risk_level: 'Unknown' as const,
            population: 'Unknown',
            available: false,
            source: {
              paper: 'Backend not available',
              authors: 'N/A',
              journal: 'N/A',
              year: 0,
              doi: 'N/A',
              table: 'N/A'
            }
          }
        }
      }, { status: 503 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Calculation failed' },
      { status: 500 }
    )
  }
}