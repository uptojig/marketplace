"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react"

/* ---------------------------------------------------------------------------
 * OperatorCombobox
 *
 * A searchable dropdown (combobox) for the Operator dashboard.
 * Designed for cases where a plain <Select> is inappropriate because the
 * option list is large (e.g. user/email lists) and needs client-side
 * filtering via a search input.
 *
 * Built on top of Radix Popover + native <input>, so it doesn't require
 * the `cmdk` dependency that shadcn's "command" component uses.
 * ---------------------------------------------------------------------------
 */

export interface ComboboxOption {
  value: string
  label: string
  /** Optional secondary line shown below label in smaller text */
  description?: string
}

interface OperatorComboboxProps {
  /** Currently selected value (controlled). */
  value: string
  /** Called when the user picks an option. */
  onValueChange: (value: string) => void
  /** The full list of options to filter. */
  options: ComboboxOption[]
  /** Placeholder shown when nothing is selected. */
  placeholder?: string
  /** Placeholder for the search input inside the dropdown. */
  searchPlaceholder?: string
  /** Text shown when filtering returns no results. */
  emptyText?: string
  /** Extra className on the trigger button. */
  className?: string
  /** Whether the combobox is disabled. */
  disabled?: boolean
}

export function OperatorCombobox({
  value,
  onValueChange,
  options,
  placeholder = "เลือก...",
  searchPlaceholder = "พิมพ์เพื่อค้นหา...",
  emptyText = "ไม่พบผลลัพธ์",
  className,
  disabled = false,
}: OperatorComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Auto-focus search input when popover opens
  React.useEffect(() => {
    if (open) {
      // Short delay so the popover animates in before we steal focus
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    } else {
      setSearch("")
    }
  }, [open])

  const selectedOption = options.find((o) => o.value === value)

  const filtered = React.useMemo(() => {
    if (!search.trim()) return options
    const q = search.toLowerCase()
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description && o.description.toLowerCase().includes(q))
    )
  }, [options, search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap transition-colors outline-none select-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30 dark:hover:bg-input/50",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)] p-0"
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Options list */}
        <div className="max-h-56 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              {emptyText}
            </p>
          ) : (
            filtered.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-hidden select-none transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent text-accent-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center",
                      !isSelected && "invisible"
                    )}
                  >
                    <CheckIcon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="block truncate">{option.label}</span>
                    {option.description && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
