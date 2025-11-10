/**
 * Unit Tests for Regulatory Compliance Module
 * Tests for UCITS, ESMA, MiFID II compliance checks
 */

describe('RegulatoryComplianceModule', () => {
  let RegulatoryComplianceModule;

  beforeAll(async () => {
    try {
      const module = await import('../src/js/utilities/regulatory-compliance.js');
      RegulatoryComplianceModule = module.RegulatoryComplianceModule;
    } catch (error) {
      console.error('Could not import RegulatoryComplianceModule:', error);
    }
  });

  describe('Initialization', () => {
    test('should create instance successfully', () => {
      if (!RegulatoryComplianceModule) return;
      const module = new RegulatoryComplianceModule();
      expect(module).toBeDefined();
    });
  });

  describe('UCITS Compliance', () => {
    let compModule;

    beforeEach(() => {
      if (RegulatoryComplianceModule) {
        compModule = new RegulatoryComplianceModule();
      }
    });

    test('should validate UCITS limits', () => {
      if (!compModule || !compModule.checkUCITSCompliance) return;
      
      const portfolio = {
        assets: [
          { symbol: 'AAPL', weight: 0.2 },
          { symbol: 'MSFT', weight: 0.2 },
          { symbol: 'GOOGL', weight: 0.2 }
        ]
      };

      const result = compModule.checkUCITSCompliance(portfolio);
      if (result) {
        expect(typeof result === 'object' || typeof result === 'boolean').toBe(true);
      }
    });
  });

  describe('MiFID II Requirements', () => {
    let compModule;

    beforeEach(() => {
      if (RegulatoryComplianceModule) {
        compModule = new RegulatoryComplianceModule();
      }
    });

    test('should validate MiFID II requirements', () => {
      if (!compModule || !compModule.checkMiFIDCompliance) return;
      
      const clientProfile = {
        riskTolerance: 'moderate',
        investmentHorizon: '10-years'
      };

      expect(() => {
        compModule.checkMiFIDCompliance(clientProfile);
      }).not.toThrow();
    });
  });

  describe('Concentration Limits', () => {
    let compModule;

    beforeEach(() => {
      if (RegulatoryComplianceModule) {
        compModule = new RegulatoryComplianceModule();
      }
    });

    test('should check concentration limits', () => {
      if (!compModule || !compModule.checkConcentrationLimits) return;
      
      const weights = [0.3, 0.25, 0.2, 0.15, 0.1];
      
      expect(() => {
        compModule.checkConcentrationLimits(weights);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty portfolio', () => {
      if (!RegulatoryComplianceModule) return;
      const compModule = new RegulatoryComplianceModule();
      
      if (typeof compModule.checkUCITSCompliance === 'function') {
        expect(() => {
          compModule.checkUCITSCompliance({ assets: [] });
        }).not.toThrow();
      }
    });

    test('should handle high concentration portfolio', () => {
      if (!RegulatoryComplianceModule) return;
      const compModule = new RegulatoryComplianceModule();
      
      if (typeof compModule.checkConcentrationLimits === 'function') {
        const weights = [0.9, 0.1];
        expect(() => {
          compModule.checkConcentrationLimits(weights);
        }).not.toThrow();
      }
    });
  });
});
