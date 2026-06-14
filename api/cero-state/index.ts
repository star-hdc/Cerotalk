import { readState, saveState } from './_shared';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      res.status(200).json(await readState());
      return;
    }

    if (req.method === 'PUT') {
      res.status(200).json(await saveState(req.body || {}));
      return;
    }

    res.setHeader('Allow', 'GET, PUT');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unexpected server error',
    });
  }
}
