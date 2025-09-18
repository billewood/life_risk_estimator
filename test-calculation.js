// Simple test to debug calculation issues
const { calculationEnforcer } = require('./lib/calculator/calculation-enforcer.ts');

async function testCalculation() {
  try {
    console.log('Testing calculation...');
    
    const inputs = {
      age: 30,
      sex: 'male',
      smoking: 'never',
      systolicBP: 120,
      bmi: 25,
      diabetes: false
    };
    
    const result = await calculationEnforcer.calculateMortalityRisk(inputs, 'test');
    console.log('Calculation successful:', result);
  } catch (error) {
    console.error('Calculation failed:', error);
  }
}

testCalculation();
