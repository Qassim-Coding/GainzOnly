import React from 'react';

export default function StockListTableHead({
  stocks,
  sortByName,
  sortBySector,
  HandleSectorFilter,
}) {
  return (
    <div className="flex justify-between items-center
     bg-gray-100 text-stone-900 rounded-md px-6 py-2 mb-2
     font-bold">
      <h3>Tickers</h3>
      <div className='flex items-center gap-2'>
        <small className="cursor-pointer test-slate-400
         hover:text-slate-800"
          onClick={() => sortByName()}
          >
          A-Z
        </small>
        <h3>Nom</h3>
        <small className="cursor-pointer text-slate-400
         hover:text-slate-800"
         onClick={() => sortByName(true)}
          >
          Z-A
        </small>
      </div>
      <div className='flex items-center gap-2'>
        <small className="cursor-pointer text-slate-400
         hover:text-slate-800"
         onClick={() => sortBySector()}
         >
         A-Z
         </small>
         <select
          className="border border-gray-300 rounded-md px-2 py-1"
          onChange={(e) => HandleSectorFilter(e.target.value)}
          >
          <options>Tous les secteurs</options>
          {[...new Set(stocks.map((stock) => stock.sector))].map((sector) => (
            <options key={sector} value={sector}>
              {sector}
            </options>
          ))}
          </select>
          <small className="cursor-pointer text-slate-400
           hover:text-slate-800"
           onClick={() => sortBySector(true)}
          >
            Z-A
          </small>
         </div>
         <h3>Actions</h3>
    </div>
  );
}
