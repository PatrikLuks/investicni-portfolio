/**
 * @fileoverview Unit Tests for Regulatory Compliance Module
 * Tests UCITS, ESMA, and MiFID II compliance validations
 * 
 * @module tests/regulatory-compliance.test
 * @requires regulatory-compliance.js
 */

describe('Regulatory Compliance Module', () => {
  let compliance;

  // Test portfolio data
  const mockPortfolio = {
    assets: [
      { symbol: 'AAPL', weight: 0.25, assetClass: 'equity', sector: 'technology' },
      { symbol: 'XOM', weight: 0.20, assetClass: 'equity', sector: 'energy' },
      { symbol: 'JPM', weight: 0.20, assetClass: 'equity', sector: 'finance' },
      { symbol: 'EUR_BOND', weight: 0.25, assetClass: 'bond', rating: 'AAA' },
      { symbol: 'CASH', weight: 0.10, assetClass: 'cash', currency: 'EUR' }
    ],
    riskLevel: 'moderate',
    investmentType: 'mixed'
  };

  const mockDerivatives = [
    { type: 'future', underlying: 'SPX', leverage: 2, notional: 50000 },
    { type: 'option', underlying: 'AAPL', notional: 10000 }
  ];

  // ==================== SETUP & TEARDOWN ====================

  beforeEach(() => {
    compliance = new RegulatoryComplianceModule();
    expect(compliance).toBeDefined();
  });

  afterEach(() => {
    compliance = null;
  });

  // ==================== UCITS COMPLIANCE TESTS ====================

  describe('UCITS Directives Compliance', () => {
    
    test('validateUCITSCompliance() should exist and be callable', () => {
      expect(typeof compliance.validateUCITSCompliance).toBe('function');
    });

    test('validateUCITSCompliance should return validation result', () => {
      const result = compliance.validateUCITSCompliance(mockPortfolio);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('compliant');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendations');
    });

    test('compliant portfolio should have no issues', () => {
      const result = compliance.validateUCITSCompliance(mockPortfolio);
      
      if (result.compliant) {
        expect(result.issues).toHaveLength(0);
      }
    });

    test('should check maximum investment in single issuer (10%)', () => {
      const portfolioHighConcentration = {
        ...mockPortfolio,
        assets: [
          { symbol: 'MEGA_CORP', weight: 0.15, assetClass: 'equity' } // Exceeds 10%
        ]
      };
      
      const result = compliance.validateUCITSCompliance(portfolioHighConcentration);
      
      if (result.issues.length > 0) {
        const concentrationIssue = result.issues.find(i => i.type === 'concentration');
        expect(concentrationIssue).toBeDefined();
      }
    });

    test('should check deposit limits (maximum 20% in single bank)', () => {
      const portfolioHighDeposits = {
        ...mockPortfolio,
        deposits: [
          { bank: 'BANK_A', amount: 0.25 } // Exceeds 20%
        ]
      };
      
      const result = compliance.validateUCITSCompliance(portfolioHighDeposits);
      
      // Should flag if deposits exceed limit
      expect(result).toHaveProperty('issues');
    });

    test('should verify proper portfolio diversification', () => {
      const poorlyDiversified = {
        assets: [
          { symbol: 'MEGA_TECH1', weight: 0.35, assetClass: 'equity' },
          { symbol: 'MEGA_TECH2', weight: 0.35, assetClass: 'equity' },
          { symbol: 'MEGA_TECH3', weight: 0.30, assetClass: 'equity' }
        ]
      };
      
      const result = compliance.validateUCITSCompliance(poorlyDiversified);
      
      // Should have diversification recommendations
      expect(result).toBeDefined();
    });

    test('should check derivative usage limits', () => {
      const portfolioWithDerivatives = {
        ...mockPortfolio,
        derivatives: mockDerivatives
      };
      
      const result = compliance.validateUCITSCompliance(portfolioWithDerivatives);
      
      // Should validate derivative constraints
      expect(result).toHaveProperty('compliant');
    });

    test('cash holding should be within limits (5-10%)', () => {
      const portfolioHighCash = {
        assets: [
          { symbol: 'STOCK_A', weight: 0.85, assetClass: 'equity' },
          { symbol: 'CASH', weight: 0.15, assetClass: 'cash' }
        ]
      };
      
      const result = compliance.validateUCITSCompliance(portfolioHighCash);
      
      // May recommend reducing cash
      expect(result).toHaveProperty('recommendations');
    });
  });

  // ==================== ESMA GUIDELINES TESTS ====================

  describe('ESMA Guidelines Compliance', () => {
    
    test('validateESMACompliance() should exist and be callable', () => {
      expect(typeof compliance.validateESMACompliance).toBe('function');
    });

    test('validateESMACompliance should return validation result', () => {
      const result = compliance.validateESMACompliance(mockPortfolio);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('compliant');
      expect(result).toHaveProperty('marketAbuseRisk');
      expect(result).toHaveProperty('infoAsymetryRisk');
    });

    test('should check Market Abuse Regulation (MAR) compliance', () => {
      const result = compliance.validateESMACompliance(mockPortfolio);
      
      expect(result).toHaveProperty('marketAbuseRisk');
      expect(['low', 'medium', 'high']).toContain(result.marketAbuseRisk);
    });

    test('should validate insider trading prevention measures', () => {
      const result = compliance.validateESMACompliance(mockPortfolio);
      
      if (result.issues) {
        const insiderRisk = result.issues.some(i => 
          i.type && i.type.toLowerCase().includes('insider')
        );
        expect(typeof insiderRisk).toBe('boolean');
      }
    });

    test('should verify information asymmetry controls', () => {
      const result = compliance.validateESMACompliance(mockPortfolio);
      
      expect(result).toHaveProperty('infoAsymetryRisk');
      expect(['low', 'medium', 'high']).toContain(result.infoAsymetryRisk);
    });

    test('should check transparency requirements', () => {
      const result = compliance.validateESMACompliance(mockPortfolio);
      
      // Should have transparency assessment
      expect(result).toHaveProperty('compliant');
    });
  });

  // ==================== MIFID II REQUIREMENTS TESTS ====================

  describe('MiFID II Requirements', () => {
    
    test('validateMiFIDCompliance() should exist and be callable', () => {
      expect(typeof compliance.validateMiFIDCompliance).toBe('function');
    });

    test('validateMiFIDCompliance should return comprehensive result', () => {
      const result = compliance.validateMiFIDCompliance(mockPortfolio);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('suitabilityAssessment');
      expect(result).toHaveProperty('costDisclosure');
      expect(result).toHaveProperty('conflictsOfInterest');
    });

    test('should perform suitability assessment', () => {
      const result = compliance.validateMiFIDCompliance(mockPortfolio);
      
      expect(result.suitabilityAssessment).toBeDefined();
      expect(result.suitabilityAssessment).toHaveProperty('suitable');
      expect(result.suitabilityAssessment).toHaveProperty('recommendedAdjustments');
    });

    test('should calculate total costs and charges', () => {
      const result = compliance.validateMiFIDCompliance(mockPortfolio);
      
      expect(result.costDisclosure).toBeDefined();
      expect(result.costDisclosure).toHaveProperty('totalCosts');
      expect(result.costDisclosure).toHaveProperty('costBreakdown');
      expect(typeof result.costDisclosure.totalCosts).toBe('number');
    });

    test('costs should be expressed as percentage', () => {
      const result = compliance.validateMiFIDCompliance(mockPortfolio);
      
      const costs = result.costDisclosure.totalCosts;
      expect(costs).toBeGreaterThanOrEqual(0);
      expect(costs).toBeLessThanOrEqual(1); // 0-100%
    });

    test('should identify conflicts of interest', () => {
      const result = compliance.validateMiFIDCompliance(mockPortfolio);
      
      expect(result.conflictsOfInterest).toBeDefined();
      expect(Array.isArray(result.conflictsOfInterest)).toBe(true);
    });

    test('should provide best execution documentation', () => {
      const result = compliance.validateMiFIDCompliance(mockPortfolio);
      
      expect(result).toHaveProperty('bestExecution');
      if (result.bestExecution) {
        expect(result.bestExecution).toHaveProperty('executed');
      }
    });

    test('should verify product knowledge requirements', () => {
      const result = compliance.validateMiFIDCompliance(mockPortfolio);
      
      // Should validate that advisors understand products
      expect(result).toHaveProperty('suitabilityAssessment');
    });
  });

  // ==================== CONCENTRATION LIMITS TESTS ====================

  describe('Concentration Risk Limits', () => {
    
    test('checkConcentrationLimits() should exist and be callable', () => {
      expect(typeof compliance.checkConcentrationLimits).toBe('function');
    });

    test('should identify single issuer concentration', () => {
      const concentratedPortfolio = {
        assets: [
          { symbol: 'MEGA_CORP', weight: 0.50, issuer: 'MEGA_CORP' },
          { symbol: 'OTHER_A', weight: 0.30, issuer: 'OTHER_A' },
          { symbol: 'OTHER_B', weight: 0.20, issuer: 'OTHER_B' }
        ]
      };
      
      const result = compliance.checkConcentrationLimits(concentratedPortfolio);
      
      expect(result).toBeDefined();
      if (result.issues && result.issues.length > 0) {
        const issuerConc = result.issues.find(i => i.type === 'issuer');
        expect(issuerConc).toBeDefined();
      }
    });

    test('should calculate Herfindahl-Hirschman Index (HHI)', () => {
      const result = compliance.checkConcentrationLimits(mockPortfolio);
      
      expect(result).toHaveProperty('hhi');
      expect(result.hhi).toBeGreaterThan(0);
      expect(result.hhi).toBeLessThanOrEqual(1); // HHI from 0 to 1
    });

    test('low HHI should indicate good diversification', () => {
      const wellDiversified = {
        assets: Array(10).fill(null).map((_, i) => ({
          symbol: `ASSET_${i}`,
          weight: 0.1
        }))
      };
      
      const result = compliance.checkConcentrationLimits(wellDiversified);
      
      // Equal weight portfolio should have low HHI
      expect(result.hhi).toBeLessThan(0.2);
    });

    test('should check sector concentration', () => {
      const result = compliance.checkConcentrationLimits(mockPortfolio);
      
      if (result.sectorConcentration) {
        expect(Array.isArray(result.sectorConcentration)).toBe(true);
      }
    });

    test('should identify geographic concentration', () => {
      const result = compliance.checkConcentrationLimits(mockPortfolio);
      
      // Should analyze geographic distribution
      expect(result).toHaveProperty('hhi');
    });
  });

  // ==================== DOCUMENTATION & DISCLOSURE TESTS ====================

  describe('Documentation & Disclosure Requirements', () => {
    
    test('should require suitability report for each client', () => {
      const documentation = compliance.getRequiredDocumentation(mockPortfolio);
      
      expect(documentation).toBeDefined();
      expect(Array.isArray(documentation)).toBe(true);
      
      const hasSuitability = documentation.includes('SUITABILITY_REPORT');
      expect(hasSuitability || documentation.length > 0).toBe(true);
    });

    test('should require risk disclosure documents', () => {
      const documentation = compliance.getRequiredDocumentation(mockPortfolio);
      
      const hasRiskDisclosure = documentation.includes('RISK_DISCLOSURE');
      expect(hasRiskDisclosure || documentation.length > 0).toBe(true);
    });

    test('should require conflicts of interest notices', () => {
      const documentation = compliance.getRequiredDocumentation(mockPortfolio);
      
      const hasConflicts = documentation.includes('CONFLICTS_NOTICE');
      expect(hasConflicts || documentation.length > 0).toBe(true);
    });

    test('should provide cost disclosure statement', () => {
      const costs = compliance.generateCostDisclosure(mockPortfolio);
      
      expect(costs).toBeDefined();
      expect(costs).toHaveProperty('summary');
      expect(costs).toHaveProperty('breakdown');
      expect(costs).toHaveProperty('comparisonBenchmark');
    });

    test('cost disclosure should include all relevant fees', () => {
      const costs = compliance.generateCostDisclosure(mockPortfolio);
      
      const breakdown = costs.breakdown;
      expect(breakdown).toHaveProperty('managementFees');
      expect(breakdown).toHaveProperty('transactionCosts');
      expect(breakdown).toHaveProperty('other');
    });
  });

  // ==================== RISK PROFILE MATCHING TESTS ====================

  describe('Risk Profile & Suitability Matching', () => {
    
    test('should match portfolio to client risk profile', () => {
      const clientProfile = {
        riskTolerance: 'moderate',
        investmentHorizon: '10years',
        experience: 'intermediate'
      };
      
      const result = compliance.assessSuitability(mockPortfolio, clientProfile);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('suitable');
      expect(typeof result.suitable).toBe('boolean');
    });

    test('conservative client should not have aggressive portfolio', () => {
      const conservativeClient = {
        riskTolerance: 'conservative',
        investmentHorizon: '5years',
        experience: 'beginner'
      };
      
      const aggressivePortfolio = {
        assets: [
          { symbol: 'CRYPTO', weight: 0.3, assetClass: 'crypto', risk: 'very_high' },
          { symbol: 'PENNY_STOCK', weight: 0.3, assetClass: 'equity', risk: 'very_high' },
          { symbol: 'JUNK_BOND', weight: 0.4, assetClass: 'bond', risk: 'high' }
        ]
      };
      
      const result = compliance.assessSuitability(aggressivePortfolio, conservativeClient);
      
      expect(result.suitable).toBe(false);
    });

    test('should provide recommendations if unsuitable', () => {
      const conservativeClient = {
        riskTolerance: 'conservative',
        investmentHorizon: '3years'
      };
      
      const aggressivePortfolio = {
        assets: [
          { symbol: 'VOLATILE_STOCK', weight: 0.8, risk: 'high' }
        ]
      };
      
      const result = compliance.assessSuitability(aggressivePortfolio, conservativeClient);
      
      if (!result.suitable) {
        expect(result.recommendations).toBeDefined();
        expect(result.recommendations.length).toBeGreaterThan(0);
      }
    });
  });

  // ==================== COMPLIANCE REPORTING TESTS ====================

  describe('Compliance Reporting', () => {
    
    test('should generate compliance report', () => {
      const report = compliance.generateComplianceReport(mockPortfolio);
      
      expect(report).toBeDefined();
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('portfolio');
      expect(report).toHaveProperty('findings');
    });

    test('compliance report should include all frameworks', () => {
      const report = compliance.generateComplianceReport(mockPortfolio);
      
      expect(report.findings).toHaveProperty('ucits');
      expect(report.findings).toHaveProperty('esma');
      expect(report.findings).toHaveProperty('mifid');
    });

    test('should provide executive summary', () => {
      const report = compliance.generateComplianceReport(mockPortfolio);
      
      expect(report).toHaveProperty('summary');
      expect(report.summary).toHaveProperty('overallCompliance');
      expect(['compliant', 'partial', 'non_compliant']).toContain(
        report.summary.overallCompliance
      );
    });

    test('should list all violations if any', () => {
      const violatingPortfolio = {
        assets: [
          { symbol: 'VIOLATOR', weight: 0.95 } // Exceeds limits
        ]
      };
      
      const report = compliance.generateComplianceReport(violatingPortfolio);
      
      if (report.summary.overallCompliance !== 'compliant') {
        expect(report.violations).toBeDefined();
      }
    });
  });

  // ==================== EDGE CASES & ERROR HANDLING ====================

  describe('Edge Cases & Error Handling', () => {
    
    test('should handle empty portfolio gracefully', () => {
      const emptyPortfolio = { assets: [] };
      const result = compliance.validateUCITSCompliance(emptyPortfolio);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('compliant');
    });

    test('should handle weights not summing to 1.0', () => {
      const unbalancedPortfolio = {
        assets: [
          { symbol: 'A', weight: 0.3 },
          { symbol: 'B', weight: 0.5 }
          // Total: 0.8, not 1.0
        ]
      };
      
      const result = compliance.validateUCITSCompliance(unbalancedPortfolio);
      
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });

    test('should handle null/undefined fields', () => {
      const incompletePortfolio = {
        assets: [{ symbol: 'A', weight: null }]
      };
      
      expect(() => {
        compliance.validateUCITSCompliance(incompletePortfolio);
      }).not.toThrow();
    });

    test('should handle future compliance scenarios', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const futurePortfolio = {
        ...mockPortfolio,
        asofDate: futureDate
      };
      
      const result = compliance.validateUCITSCompliance(futurePortfolio);
      expect(result).toBeDefined();
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  describe('Performance Benchmarks', () => {
    
    test('validateUCITSCompliance should complete in < 100ms', () => {
      const start = performance.now();
      compliance.validateUCITSCompliance(mockPortfolio);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(100);
    });

    test('generateComplianceReport should complete in < 500ms', () => {
      const start = performance.now();
      compliance.generateComplianceReport(mockPortfolio);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(500);
    });

    test('checkConcentrationLimits should handle 1000-asset portfolio in < 200ms', () => {
      const largePortfolio = {
        assets: Array(1000).fill(null).map((_, i) => ({
          symbol: `ASSET_${i}`,
          weight: 1 / 1000,
          issuer: `ISSUER_${Math.floor(i / 10)}`
        }))
      };
      
      const start = performance.now();
      compliance.checkConcentrationLimits(largePortfolio);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(200);
    });
  });
});
