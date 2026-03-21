import { Router, Request, Response } from 'express';
import { UsuarioService } from '../services/UsuarioService';

const router: Router = Router();

// GET /api/usuarios - Get all usuarios
router.get('/', async (_req: Request, res: Response) => {
  const usuarioService = new UsuarioService();
  try {
    const usuarios = await usuarioService.getAllUsuarios();
    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/usuarios/:id - Get usuario by id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  const usuarioService = new UsuarioService();
  try {
    const usuario = await usuarioService.getUsuarioById(parseInt(req.params.id));
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario not found'
      });
    }
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/usuarios - Create new usuario
router.post('/', async (req: Request, res: Response) => {
  const usuarioService = new UsuarioService();
  try {
    const usuario = await usuarioService.createUsuario(req.body);
    res.status(201).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/usuarios/:id - Update usuario
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  const usuarioService = new UsuarioService();
  try {
    const usuario = await usuarioService.updateUsuario(parseInt(req.params.id), req.body);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario not found'
      });
    }
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/usuarios/:id - Delete usuario (soft delete)
router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  const usuarioService = new UsuarioService();
  try {
    const usuario = await usuarioService.deleteUsuario(parseInt(req.params.id));
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario not found'
      });
    }
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
