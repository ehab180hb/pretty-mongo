import { Collection, FindOneAndUpdateOption, FindOneOptions, ObjectId } from 'mongodb'
import { removeValues, isEmptyObject } from './util'

type UpdateOperators =
  | '$currentDate'
  | '$inc'
  | '$min'
  | '$max'
  | '$mul'
  | '$rename'
  | '$set'
  | '$set'
  | '$setOnInsert'
  | '$unset'
  | '$addToSet'
  | '$pop'
  | '$push'
  | '$pull'

/**
 * instantiate the class with a given MongoDB collection
 * @example
 * const xDb = new DBMethods(getDb().collection('x'))
 */
export class MongoCollectionMethods<BackendModel extends { _id: ObjectId }> {
  constructor(private c: Collection) {}

  /**
   * Creates a DB record
   */
  async createOne(record: BackendModel): Promise<ObjectId> {
    return ((await this.c.insertOne(record)).insertedId as any) as ObjectId
  }

  /**
   * Updates a DB record
   */
  async updateOne(
    criteria: Partial<BackendModel>,
    update: Partial<BackendModel>,
    options?: FindOneAndUpdateOption,
  ): Promise<boolean> {
    // https://jira.mongodb.org/browse/SERVER-26961
    const toUpdate = { $set: {} as any, $unset: {} as any }
    for (const k in update) {
      if (update[k] === undefined) toUpdate.$unset[k] = undefined
      else toUpdate.$set[k] = update[k]
    }
    const u = await this.c.findOneAndUpdate(criteria, removeValues(toUpdate, isEmptyObject), options)
    return u.lastErrorObject.updatedExisting
  }

  /**
   * This method is intended to cover use cases where the use of field update operators is needed.
   * https://docs.mongodb.com/manual/reference/operator/update-field/
   */
  async updateFieldsWithSpecialOp(
    criteria: object,
    update: { [k in UpdateOperators]?: { [k: string]: any } },
    options?: FindOneAndUpdateOption,
  ): Promise<number> {
    const res = await this.c.findOneAndUpdate(criteria, update, options)
    return res.lastErrorObject.updatedExisting
  }

  /**
   * Grabs one record from the DB by its ID
   */
  async getOneById(id: ObjectId, options?: FindOneOptions): Promise<BackendModel | undefined> {
    const o = await this.c.findOne({ _id: id }, options)
    if (!o) return // we want undefined instead of null
    return o
  }

  /**
   * Grabs one record from the DB by an arbitrary field
   */
  async getOne(criteria: Partial<BackendModel>, options?: FindOneOptions): Promise<BackendModel | undefined> {
    const o = await this.c.findOne(criteria, options)
    if (!o) return // we want undefined instead of null
    return o
  }

  /**
   * Grabs records by a field.
   */
  async getMany(criteria: Partial<BackendModel>, options?: FindOneOptions): Promise<BackendModel[]> {
    return this.c.find(criteria, options).toArray()
  }

  /**
   * Returns the total amount of items.
   */
  async getTotalCount(criteria: Partial<BackendModel> = {}, options?: FindOneOptions): Promise<number> {
    return this.c.find(criteria, options).count()
  }

  /**
   * Deletes a record from the DB and returns the count.
   */
  async deleteOneById(id: ObjectId) {
    return (await this.c.deleteOne({ _id: id })).deletedCount
  }

  /**
   * Will insert the given documents into db and return an array
   * of the inserted documents.
   */
  async createMany(records: BackendModel[]): Promise<ObjectId[]> {
    const ids = (await this.c.insertMany(records)).insertedIds
    return (Object.values(ids) as any) as Promise<ObjectId[]>
  }
}
