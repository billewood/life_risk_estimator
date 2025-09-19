/**
 * JavaScript Client for Mortality Calculator API
 * Example usage for frontend integration
 */

class MortalityCalculatorAPI {
    constructor(baseURL = 'http://localhost:5000') {
        this.baseURL = baseURL;
    }

    /**
     * Calculate mortality risk for an individual
     * @param {Object} params - Calculation parameters
     * @param {number} params.age - Age in years
     * @param {string} params.sex - 'male' or 'female'
     * @param {Object} params.risk_factors - Risk factor object
     * @param {string} params.time_horizon - '6_months', '1_year', '5_years'
     * @returns {Promise<Object>} Risk calculation results
     */
    async calculateRisk(params) {
        try {
            const response = await fetch(`${this.baseURL}/api/calculate-risk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }

            // Return the frontend-expected format
            return {
                lifeExpectancy: data.lifeExpectancy,
                oneYearMortality: data.oneYearMortality,
                riskFactors: data.riskFactors,
                causesOfDeath: data.causesOfDeath,
                metadata: data.metadata,
                dataSources: data.data_sources
            };
        } catch (error) {
            console.error('Error calculating risk:', error);
            throw error;
        }
    }

    /**
     * Model intervention effects on mortality risk
     * @param {Object} params - Intervention parameters
     * @param {number} params.current_risk - Current mortality risk
     * @param {Object} params.interventions - Intervention object
     * @returns {Promise<Object>} Intervention results
     */
    async modelInterventions(params) {
        try {
            const response = await fetch(`${this.baseURL}/api/model-interventions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }

            return data;
        } catch (error) {
            console.error('Error modeling interventions:', error);
            throw error;
        }
    }

    /**
     * Get all relative risks with source information
     * @returns {Promise<Object>} Relative risks database
     */
    async getRelativeRisks() {
        try {
            const response = await fetch(`${this.baseURL}/api/relative-risks`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }

            return data.relative_risks;
        } catch (error) {
            console.error('Error getting relative risks:', error);
            throw error;
        }
    }

    /**
     * Get data source status
     * @returns {Promise<Object>} Data source status
     */
    async getDataStatus() {
        try {
            const response = await fetch(`${this.baseURL}/api/data-status`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }

            return data.data_status;
        } catch (error) {
            console.error('Error getting data status:', error);
            throw error;
        }
    }

    /**
     * Verify relative risk sources
     * @returns {Promise<Object>} Verification results
     */
    async verifySources() {
        try {
            const response = await fetch(`${this.baseURL}/api/verify-sources`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }

            return data;
        } catch (error) {
            console.error('Error verifying sources:', error);
            throw error;
        }
    }

    /**
     * Health check
     * @returns {Promise<Object>} Health status
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/api/health`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking health:', error);
            throw error;
        }
    }
}

// Example usage
async function exampleUsage() {
    const api = new MortalityCalculatorAPI();

    try {
        // Health check
        console.log('Checking API health...');
        const health = await api.healthCheck();
        console.log('Health status:', health);

        // Calculate risk
        console.log('\nCalculating mortality risk...');
        const riskParams = {
            age: 65,
            sex: 'male',
            risk_factors: {
                smoking_status: 'current',
                systolic_bp: 140,
                bp_treated: false,
                bmi: 28,
                fitness_level: 'sedentary',
                alcohol_pattern: 'heavy',
                diabetes: false
            },
            time_horizon: '1_year'
        };

        const riskResult = await api.calculateRisk(riskParams);
        console.log('Risk calculation result:', riskResult);
        
        // Access the frontend-expected format
        console.log('Life Expectancy:', riskResult.lifeExpectancy, 'years');
        console.log('One Year Mortality:', (riskResult.oneYearMortality * 100).toFixed(2) + '%');
        
        // Access risk factors with source information
        console.log('Risk Factors:');
        Object.entries(riskResult.riskFactors).forEach(([factor, data]) => {
            console.log(`  ${factor}: ${data.value}x (${data.source})`);
        });
        
        // Access causes of death
        console.log('Causes of Death:');
        riskResult.causesOfDeath.forEach(cause => {
            console.log(`  ${cause.cause}: ${cause.percentage.toFixed(1)}% (${cause.riskLevel})`);
        });

        // Model interventions
        console.log('\nModeling interventions...');
        const interventionParams = {
            current_risk: riskResult.oneYearMortality,
            interventions: {
                quit_smoking: true,
                reduce_bp: 10,
                improve_fitness: 'moderate',
                lose_weight: 5
            }
        };

        const interventionResult = await api.modelInterventions(interventionParams);
        console.log('Intervention results:', interventionResult);

        // Get relative risks
        console.log('\nGetting relative risks...');
        const relativeRisks = await api.getRelativeRisks();
        console.log('Relative risks database:', relativeRisks);

        // Get data status
        console.log('\nGetting data status...');
        const dataStatus = await api.getDataStatus();
        console.log('Data status:', dataStatus);

        // Verify sources
        console.log('\nVerifying sources...');
        const verification = await api.verifySources();
        console.log('Source verification:', verification);

    } catch (error) {
        console.error('Example usage failed:', error);
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MortalityCalculatorAPI;
}

// Run example if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
    exampleUsage();
}
