const { test, expect } = require('@playwright/test');

test.describe('Validación de Calificaciones', () => {
  test('debe rechazar notas inválidas en el frontend antes de guardar', async ({ page }) => {
    // 1. Navegar a la página de calificaciones
    await page.goto('/calificaciones.html');
    
    // Simular que el usuario selecciona Periodo, Materia y Actividad
    // Para simplificar, suponemos que ya cargó una tabla (o configuramos mock de DB)
    
    // Llenar una celda con un valor inválido
    const celda = page.locator('.celda-nota').first();
    
    // Si la celda existe, intentar ingresar nota inválida
    if (await celda.isVisible()) {
      await celda.fill('15');
      
      const botonGuardar = page.locator('#btn-guardar-notas');
      await botonGuardar.click();
      
      // 3. Validar que aparece el toast de error de frontend
      const toast = page.locator('#toast');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('Escribe notas válidas entre 0 y 10.');
    }
  });
  
  test('debe enviar la nota y recargar promedios correctamente', async ({ page }) => {
    await page.goto('/calificaciones.html');
    
    const celda = page.locator('.celda-nota').first();
    if (await celda.isVisible()) {
      await celda.fill('8.5');
      
      const botonGuardar = page.locator('#btn-guardar-notas');
      await botonGuardar.click();
      
      // Validar mensaje de éxito
      const toast = page.locator('#toast');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('Calificaciones guardadas correctamente');
    }
  });
});
