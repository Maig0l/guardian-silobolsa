import { Router, Request, Response } from 'express';
import { SilobolsaService } from '../services/SilobolsaService';

const router = Router();
const silobolsaService = new SilobolsaService();

// GET /api/silobolsas - Get all silobolsas
router.get('/', async (req: Request, res: Response) => {
  try {
    const silobolsas = await silobolsaService.getAllSilobolsas();
    res.json({
      success: true,
      data: silobolsas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/silobolsas/:id - Get silobolsa by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const silobolsa = await silobolsaService.getSilobolsaById(parseInt(req.params.id));
    if (!silobolsa) {
      return res.status(404).json({
        success: false,
        error: 'Silobolsa not found'
      });
    }
    res.json({
      success: true,
      data: silobolsa
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/silobolsas - Create new silobolsa
router.post('/', async (req: Request, res: Response) => {
  try {
    const silobolsa = await silobolsaService.createSilobolsa(req.body);
    res.status(201).json({
      success: true,
      data: silobolsa
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/silobolsas/:id - Update silobolsa
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const silobolsa = await silobolsaService.updateSilobolsa(parseInt(req.params.id), req.body);
    if (!silobolsa) {
      return res.status(404).json({
        success: false,
        error: 'Silobolsa not found'
      });
    }
    res.json({
      success: true,
      data: silobolsa
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/silobolsas/:id - Delete silobolsa (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const silobolsa = await silobolsaService.deleteSilobolsa(parseInt(req.params.id));
    if (!silobolsa) {
      return res.status(404).json({
        success: false,
        error: 'Silobolsa not found'
      });
    }
    res.json({
      success: true,
      data: silobolsa
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

module.exports = router;
