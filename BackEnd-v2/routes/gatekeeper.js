import express from 'express';
const router = express.Router();
import sequelize from 'sequelize';

export default router;

const {
  Provider,
  Statistic,
  ApiToken,
  Campaign
} = models;

router.get('/api/tsreference', async (req, res, next) => {
  let {userId} = req;
  try {
    let apiTokens = await ApiToken.findAll({
      where: {userId},
      include: [
        {
          model: Provider,
          required: true,
        }
      ]
    })

    let result = apiTokens.map((apiToken) => {
      return {
        id: apiToken.id,
        name: apiToken.Provider.name,
        token: apiToken.token,
        tsId: apiToken.provider_id
      }
    })
    res.json({
      status: 1,
      message: 'success',
      data: {
        tsreferences: result
      }
    })
  } catch (e) {
    next(e)
  }
})

async function upsert(req, res, next) {
  try {
    let {userId} = req;
    let {token, tsId} = req.body;
    let provider = await Provider.findById(tsId);
    if (!provider) throw new Error('provider not found');
    await ApiToken.upsert({
      token,
      provider_id: tsId,
      userId
    })
    res.json({
      status: 1,
      message: 'success'
    })
  } catch (e) {
    next(e)
  }
}

router.post('/api/tsreference', upsert)

router.put('/api/tsreference/:id', upsert)


router.get('/api/third-traffics', async (req, res, next) => {
  try {
    let providers = await Provider.findAll()
    res.json({
      status: 1,
      message: 'success',
      data: {
        thirdTraffics: providers
      }
    })
  } catch (e) {
    next(e)
  }
})

// from=2017-02-26T00:00&limit=500&page=1&to=2017-02-27T00:00&tsReferenceId=1&tz=%2B08:00

router.get('/api/tsreport', async (req, res, next) => {
  try {
    let {userId} = req;
    let {from, to, tsReferenceId: provider_id} = req.query;
    let rows = await Statistic.findAll({
      attributes: [
        'campaign_id',
        [sequelize.literal('sum(click)'), 'clicks'],
        [sequelize.literal('sum(cost)'), 'cost'],
        [sequelize.literal('sum(impression)'), 'impressions']
      ],
      include: [
        {
          model: Provider,
          required: true
        },
        {
          model: Campaign,
          required: true
        }
      ],
      where: {
        provider_id,
        $and: [
          {date: {$gte: from}},
          {date: {$lte: to}}
        ]
      },
      group: ['campaign_id']
    })

    let result = rows.map(row => {
      return {
        campaignName: row.Campaign.name,
        campaignId: row.Campaign.campaign_identity,
        clicks: parseInt(row.dataValues.clicks),
        cost: parseFloat(row.dataValues.cost).toFixed(2),
        impressions: parseInt(row.dataValues.impressions)
      }
    })
    res.json({
      status: 1,
      message: 'success',
      data: {
        totalRows: result.length,
        rows: result
      }
    })
  } catch (e) {
    next(e);
  }
})
