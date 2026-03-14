import { useState, useMemo } from 'react'
import { getPlayableCountryNames, CONTINENTS, getContinent } from '@/events/geodle/countryRelations'

interface CountrySelectorProps {
  selectedCountries: string[]
  onSelect: (countries: string[]) => void
  maxCountries?: number
}

export function CountrySelector({
  selectedCountries,
  onSelect,
  maxCountries = 5,
}: CountrySelectorProps) {
  const [search, setSearch] = useState('')
  const [continentFilter, setContinentFilter] = useState<string>('all')

  const allCountries = useMemo(() => getPlayableCountryNames(), [])

  const filteredCountries = useMemo(() => {
    return allCountries.filter((country) => {
      // Already selected - show in selected list, not available
      if (selectedCountries.includes(country)) return false

      // Search filter
      if (search && !country.toLowerCase().includes(search.toLowerCase())) {
        return false
      }

      // Continent filter
      if (continentFilter !== 'all') {
        const continent = getContinent(country)
        if (continent !== continentFilter) return false
      }

      return true
    })
  }, [allCountries, selectedCountries, search, continentFilter])

  const handleAddCountry = (country: string) => {
    if (selectedCountries.length >= maxCountries) return
    onSelect([...selectedCountries, country])
    setSearch('')
  }

  const handleRemoveCountry = (country: string) => {
    onSelect(selectedCountries.filter((c) => c !== country))
  }

  const handleMoveCountry = (index: number, direction: 'up' | 'down') => {
    const newList = [...selectedCountries]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newList.length) return
    ;[newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]]
    onSelect(newList)
  }

  return (
    <div className="space-y-6">
      {/* Selected Countries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-300">
            Selected Countries ({selectedCountries.length}/{maxCountries})
          </h3>
          {selectedCountries.length > 0 && (
            <button
              onClick={() => onSelect([])}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear All
            </button>
          )}
        </div>

        {selectedCountries.length === 0 ? (
          <div className="p-4 border border-dashed border-gray-600 rounded-lg text-center text-gray-500">
            Select {maxCountries} countries from the list below
          </div>
        ) : (
          <div className="space-y-2">
            {selectedCountries.map((country, index) => (
              <div
                key={country}
                className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] rounded-lg border border-gray-700"
              >
                <span className="text-[#FFD700] font-bold w-6">{index + 1}</span>
                <span className="text-white flex-1">{country}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveCountry(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveCountry(index, 'down')}
                    disabled={index === selectedCountries.length - 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleRemoveCountry(country)}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Country Selection */}
      {selectedCountries.length < maxCountries && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Add Countries</h3>

          {/* Filters */}
          <div className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="flex-1 px-3 py-2 bg-[#0a1628] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
            />
            <select
              value={continentFilter}
              onChange={(e) => setContinentFilter(e.target.value)}
              className="px-3 py-2 bg-[#0a1628] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FFD700]"
            >
              <option value="all">All Continents</option>
              {CONTINENTS.filter((c) => c !== 'Antarctica').map((continent) => (
                <option key={continent} value={continent}>
                  {continent}
                </option>
              ))}
            </select>
          </div>

          {/* Country Grid */}
          <div className="max-h-64 overflow-y-auto border border-gray-700 rounded-lg">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No countries match your filters
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-2">
                {filteredCountries.slice(0, 60).map((country) => (
                  <button
                    key={country}
                    onClick={() => handleAddCountry(country)}
                    className="px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#FFD700]/10 hover:text-[#FFD700] rounded transition"
                  >
                    {country}
                  </button>
                ))}
                {filteredCountries.length > 60 && (
                  <div className="px-3 py-2 text-sm text-gray-500 col-span-full">
                    + {filteredCountries.length - 60} more (use search to narrow down)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
