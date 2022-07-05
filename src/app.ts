import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'

import campaignsRouter from './routes/campaigns'
import categoriesRouter from './routes/categories'
import informationsRouter from './routes/informations'
import promotionsRouter from './routes/promotions'
import shopItemsRouter from './routes/shopItems'
import tagsRouter from './routes/tags'

const swaggerDocument = YAML.load(
  path.resolve(__dirname, '../openapi/reference/openapi.yaml'),
)
const app = express()

// CORSを許可する
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/campaigns', campaignsRouter)
app.use('/categories', categoriesRouter)
app.use('/informations', informationsRouter)
app.use('/promotions', promotionsRouter)
app.use('/shop_items', shopItemsRouter)
app.use('/tags', tagsRouter)

export default app
