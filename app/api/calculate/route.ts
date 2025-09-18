import { NextRequest, NextResponse } from 'next/server';
import { calculationEnforcer } from '@/lib/calculator/calculation-enforcer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.age || !body.sex) {
      return NextResponse.json(
        { error: 'Age and sex are required' },
        { status: 400 }
      );
    }
    
    // Set defaults for optional fields
    const inputs = {
      age: body.age,
      sex: body.sex,
      smoking: body.smoking || 'never',
      yearsSinceQuitting: body.yearsSinceQuitting,
      systolicBP: body.systolicBP || 120,
      onBPMedication: body.onBPMedication || false,
      totalCholesterol: body.totalCholesterol,
      hdlCholesterol: body.hdlCholesterol,
      bmi: body.bmi || 25,
      waistCircumference: body.waistCircumference,
      diabetes: body.diabetes || false,
      yearsWithDiabetes: body.yearsWithDiabetes,
      cardiorespiratoryFitness: body.cardiorespiratoryFitness,
      physicalActivity: body.physicalActivity,
      alcoholConsumption: body.alcoholConsumption,
      dietQuality: body.dietQuality,
      race: body.race || 'white',
      region: body.region || 'moderate',
      difficultyWalking: body.difficultyWalking,
      difficultyBathing: body.difficultyBathing,
      difficultyManagingMoney: body.difficultyManagingMoney,
      difficultyManagingMedications: body.difficultyManagingMedications,
      falls: body.falls,
      weightLoss: body.weightLoss,
      hospitalizations: body.hospitalizations
    };
    
    // Calculate mortality risk through centralized enforcer
    const result = await calculationEnforcer.calculateMortalityRisk(inputs, 'api-calculate');
    
    return NextResponse.json({
      success: true,
      result,
      requestId: result.requestId || 'unknown'
    });
    
  } catch (error) {
    console.error('Error in mortality calculation API:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      cause: error instanceof Error ? (error as any).cause : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Mortality calculation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const audit = calculationEnforcer.getAudit();
  const stats = calculationEnforcer.getStatistics();
  
  return NextResponse.json({
    message: 'Mortality Risk Calculator API',
    version: '1.0.0',
    endpoints: {
      'POST /api/calculate': 'Calculate mortality risk',
      'GET /api/calculate': 'Get API information'
    },
    audit,
    statistics: stats
  });
}

