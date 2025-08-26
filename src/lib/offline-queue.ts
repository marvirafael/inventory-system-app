import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface QueueItem {
  id: string
  type: 'receive' | 'transfer' | 'produce' | 'dispatch'
  data: any
  timestamp: number
  retryCount: number
}

interface OfflineDB extends DBSchema {
  queue: {
    key: string
    value: QueueItem
  }
}

class OfflineQueue {
  private db: IDBPDatabase<OfflineDB> | null = null

  async init() {
    this.db = await openDB<OfflineDB>('inventory-offline', 1, {
      upgrade(db) {
        db.createObjectStore('queue', { keyPath: 'id' })
      },
    })
  }

  async add(type: QueueItem['type'], data: any): Promise<string> {
    if (!this.db) await this.init()
    
    const id = crypto.randomUUID()
    const item: QueueItem = {
      id,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    }

    await this.db!.add('queue', item)
    return id
  }

  async getAll(): Promise<QueueItem[]> {
    if (!this.db) await this.init()
    return this.db!.getAll('queue')
  }

  async remove(id: string): Promise<void> {
    if (!this.db) await this.init()
    await this.db!.delete('queue', id)
  }

  async incrementRetry(id: string): Promise<void> {
    if (!this.db) await this.init()
    const item = await this.db!.get('queue', id)
    if (item) {
      item.retryCount++
      await this.db!.put('queue', item)
    }
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init()
    await this.db!.clear('queue')
  }

  async sync(): Promise<{ success: number; failed: number }> {
    const items = await this.getAll()
    let success = 0
    let failed = 0

    for (const item of items) {
      try {
        await this.processItem(item)
        await this.remove(item.id)
        success++
      } catch (error) {
        console.error('Failed to sync item:', item, error)
        if (item.retryCount < 3) {
          await this.incrementRetry(item.id)
        } else {
          await this.remove(item.id) // Remove after 3 failed attempts
        }
        failed++
      }
    }

    return { success, failed }
  }

  private async processItem(item: QueueItem): Promise<void> {
    const { supabase } = await import('./supabase')
    
    switch (item.type) {
      case 'receive':
        await supabase.rpc('receive_inventory', item.data)
        break
      case 'produce':
        await supabase.rpc('produce_batch', item.data)
        break
      case 'dispatch':
        await supabase.rpc('dispatch_with_sales', item.data)
        break
      default:
        throw new Error(`Unknown queue item type: ${item.type}`)
    }
  }
}

export const offlineQueue = new OfflineQueue()
