/**
 * E2E Tests - Portfolio Management Flow
 * Critical user scenarios for Investment Portfolio Manager Pro
 */

import { test, expect } from '@playwright/test';

test.describe('Portfolio Management - Complete User Flow', () => {
  test('should complete full workflow: setup client → add fund → view dashboard', async ({ page }) => {
    // Navigate to application
    await page.goto('/');
    
    // Wait for app to load
    await expect(page.locator('#clientNameCard')).toBeVisible();
    
    // Step 1: Fill client information
    await page.fill('#clientName', 'Jan Novák');
    await page.fill('#advisorName', 'Petr Svoboda');
    await page.fill('#advisorEmail', 'petr.svoboda@example.com');
    
    // Submit client form
    await page.click('button[type="submit"]', { selector: '#clientForm button' });
    
    // Verify client card is hidden and portfolio card is visible
    await expect(page.locator('#clientNameCard')).toBeHidden();
    await expect(page.locator('#portfolioCard')).toBeVisible();
    
    // Step 2: Add investment fund
    await page.fill('#fondName', 'Test Investment Fund');
    await page.fill('#producer', 'Test Fund Manager');
    await page.fill('#investment', '100000');
    await page.fill('#value', '110000');
    await page.fill('#investmentDate', '2024-01-01');
    
    // Submit portfolio form
    await page.click('#portfolioForm button[type="submit"]');
    
    // Wait for success toast
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });
    
    // Step 3: Verify dashboard is visible and contains data
    await expect(page.locator('#dashboard')).toBeVisible();
    await expect(page.locator('#fondListCard')).toBeVisible();
    
    // Check if KPI values are displayed
    await expect(page.locator('#kpiValueInvestment')).toContainText('100');
    await expect(page.locator('#kpiValueCurrent')).toContainText('110');
    
    // Verify fund appears in table
    const fundRow = page.locator('#fondTable tbody tr').first();
    await expect(fundRow).toContainText('Test Investment Fund');
    await expect(fundRow).toContainText('Test Fund Manager');
  });

  test('should persist data after page reload', async ({ page }) => {
    // Setup client and add fund
    await page.goto('/');
    await page.fill('#clientName', 'Test Client');
    await page.fill('#advisorName', 'Test Advisor');
    await page.fill('#advisorEmail', 'test@example.com');
    await page.click('#clientForm button[type="submit"]');
    
    await page.fill('#fondName', 'Persistent Fund');
    await page.fill('#producer', 'Persistence Manager');
    await page.fill('#investment', '50000');
    await page.fill('#value', '55000');
    await page.fill('#investmentDate', '2024-01-15');
    await page.click('#portfolioForm button[type="submit"]');
    
    // Wait for toast to confirm save
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });
    
    // Reload page
    await page.reload();
    
    // Verify data persists
    await expect(page.locator('#clientNameDisplay')).toContainText('Test Client');
    
    // Check if fund is still in table
    const fundRow = page.locator('#fondTable tbody tr').first();
    await expect(fundRow).toContainText('Persistent Fund');
  });

  test('should handle dark mode toggle', async ({ page }) => {
    await page.goto('/');
    
    // Check initial state (light mode)
    const body = page.locator('body');
    await expect(body).not.toHaveClass(/dark-mode/);
    
    // Click dark mode toggle
    const darkModeToggle = page.locator('#darkModeToggle');
    await expect(darkModeToggle).toBeVisible();
    await darkModeToggle.click();
    
    // Verify dark mode is applied
    await expect(body).toHaveClass(/dark-mode/);
    
    // Toast should appear
    await expect(page.locator('.toast.info')).toBeVisible({ timeout: 3000 });
  });

  test('should search and filter funds', async ({ page }) => {
    // Setup with multiple funds
    await page.goto('/');
    await page.fill('#clientName', 'Search Test');
    await page.fill('#advisorName', 'Advisor');
    await page.fill('#advisorEmail', 'advisor@test.com');
    await page.click('#clientForm button[type="submit"]');
    
    // Add first fund
    await page.fill('#fondName', 'Alpha Fund');
    await page.fill('#producer', 'Manager A');
    await page.fill('#investment', '10000');
    await page.fill('#value', '11000');
    await page.fill('#investmentDate', '2024-01-01');
    await page.click('#portfolioForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    // Add second fund
    await page.fill('#fondName', 'Beta Fund');
    await page.fill('#producer', 'Manager B');
    await page.fill('#investment', '20000');
    await page.fill('#value', '22000');
    await page.fill('#investmentDate', '2024-02-01');
    await page.click('#portfolioForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    // Verify both funds are visible
    await expect(page.locator('#fondTable tbody tr')).toHaveCount(2);
    
    // Search for "Alpha"
    await page.fill('#searchInput', 'Alpha');
    await page.waitForTimeout(400); // Wait for debounce
    
    // Verify only Alpha Fund is visible
    const visibleRows = page.locator('#fondTable tbody tr:visible');
    await expect(visibleRows).toHaveCount(1);
    await expect(visibleRows.first()).toContainText('Alpha Fund');
  });

  test('should export CSV', async ({ page }) => {
    // Setup with data
    await page.goto('/');
    await page.fill('#clientName', 'Export Test');
    await page.fill('#advisorName', 'Advisor');
    await page.fill('#advisorEmail', 'export@test.com');
    await page.click('#clientForm button[type="submit"]');
    
    await page.fill('#fondName', 'Export Fund');
    await page.fill('#producer', 'Manager');
    await page.fill('#investment', '100000');
    await page.fill('#value', '105000');
    await page.fill('#investmentDate', '2024-01-01');
    await page.click('#portfolioForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    // Setup download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click generate report button
    await page.click('#generateReport');
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download filename contains CSV
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should delete fund with confirmation', async ({ page }) => {
    // Setup with fund
    await page.goto('/');
    await page.fill('#clientName', 'Delete Test');
    await page.fill('#advisorName', 'Advisor');
    await page.fill('#advisorEmail', 'delete@test.com');
    await page.click('#clientForm button[type="submit"]');
    
    await page.fill('#fondName', 'To Delete');
    await page.fill('#producer', 'Manager');
    await page.fill('#investment', '50000');
    await page.fill('#value', '50000');
    await page.fill('#investmentDate', '2024-01-01');
    await page.click('#portfolioForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    // Verify fund exists
    await expect(page.locator('#fondTable tbody tr')).toHaveCount(1);
    
    // Click delete button
    await page.click('.btn-danger[data-index="0"]');
    
    // Confirmation dialog should appear
    await expect(page.locator('.confirm-dialog')).toBeVisible();
    await expect(page.locator('.confirm-title')).toContainText('Smazat fond');
    
    // Confirm deletion
    await page.click('#confirmBtn');
    
    // Wait for dialog to close
    await expect(page.locator('.confirm-dialog')).not.toBeVisible();
    
    // Verify fund is deleted
    await expect(page.locator('#fondTable tbody tr')).toHaveCount(0);
    
    // Success toast should appear
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Accessibility & Performance', () => {
  test('should have proper page title and meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Investment Portfolio Manager/i);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if key elements are visible
    await expect(page.locator('#clientNameCard')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
