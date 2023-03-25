import worker from '/_ayu/src/service-worker/worker.js'
import { schema } from '../schema/main.js'
import clientDbSeeds from './client-db-seeds.js'

worker({ schema, clientDbSeeds })
