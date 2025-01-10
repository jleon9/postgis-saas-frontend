// pages/api/properties/[id]/walk-score.ts
import { SpatialService } from '@/lib/spatialData/spatial/spatial'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const spatialService = new SpatialService()
  
  const score = await spatialService.calculateWalkScore(id as string)
  res.json({ score })
}