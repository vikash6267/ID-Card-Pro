"use client"

import { useEffect, useRef } from "react"
import JsBarcode from "jsbarcode"

const BarcodeElement = ({ content, size, rotation = 0 }) => {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || !content) return

    try {
      JsBarcode(svgRef.current, content, {
        format: "CODE128",
        width: 2,
        height: size.height * 0.8,
        displayValue: true,
        fontSize: Math.max(10, size.height * 0.1),
        margin: 0,
        background: "transparent",
        lineColor: "#000000",
      })

      // Remove default white rectangle background
      const rect = svgRef.current.querySelector("rect")
      if (rect) {
        rect.remove()
      }
    } catch (error) {
      console.error("Error generating barcode:", error)
      // If error occurs, try with a valid fallback value
      try {
        JsBarcode(svgRef.current, "0123456789", {
          format: "CODE128",
          width: 2,
          height: size.height * 0.8,
          displayValue: true,
          fontSize: Math.max(10, size.height * 0.1),
          margin: 0,
          background: "transparent",
          lineColor: "#000000",
        })

        // Remove default white rectangle background
        const rect = svgRef.current.querySelector("rect")
        if (rect) {
          rect.remove()
        }
      } catch (fallbackError) {
        console.error("Fallback barcode also failed:", fallbackError)
      }
    }
  }, [content, size.height])

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ transform: `rotate(${rotation}deg)` }}>
      <svg ref={svgRef} className="max-w-full max-h-full" />
    </div>
  )
}

export default BarcodeElement

