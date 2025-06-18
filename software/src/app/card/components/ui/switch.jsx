import * as React from "react"

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <input
    type="checkbox"
    role="switch"
    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input ${className}`}
    ref={ref}
    {...props}
  />
))
Switch.displayName = "Switch"

export { Switch }
