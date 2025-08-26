import Papa from 'papaparse'

export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const formatStockForExport = (stockData: any[]) => {
  return stockData.map(item => ({
    'Item Name': item.item_name,
    'Unit': item.unit,
    'Storage Qty': item.storage_qty || 0,
    'Processing Qty': item.processing_qty || 0,
    'Exit Qty': item.exit_qty || 0,
    'Total Qty': item.total_qty || 0,
    'Export Date': new Date().toISOString().split('T')[0]
  }))
}

export const formatHistoryForExport = (historyData: any[]) => {
  return historyData.map(item => ({
    'Date': new Date(item.created_at).toLocaleDateString(),
    'Time': new Date(item.created_at).toLocaleTimeString(),
    'Item': item.item_name,
    'Qty In': item.qty_in || '',
    'Qty Out': item.qty_out || '',
    'Location': item.location,
    'Unit Cost': item.unit_cost || '',
    'Sell Price': item.sell_price || '',
    'Reference': item.reference || '',
    'Notes': item.notes || '',
    'Batch ID': item.batch_id || ''
  }))
}
