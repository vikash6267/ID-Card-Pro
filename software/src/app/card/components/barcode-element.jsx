"use client"

import { useEffect, useRef } from "react"
import JsBarcode from "jsbarcode"

const BarcodeElement = ({ content, size, rotation = 0 }) => {
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    // Use content or default value
    const barcodeContent = content || "123456789012";
    
    // Get actual container dimensions
    const containerHeight = containerRef.current.offsetHeight || 100;
    const containerWidth = containerRef.current.offsetWidth || 200;

    try {
      JsBarcode(svgRef.current, barcodeContent, {
        format: "CODE128",
        width: Math.max(1, Math.floor(containerWidth / 100)),
        height: Math.max(40, containerHeight * 0.6),
        displayValue: true,
        fontSize: Math.max(10, containerHeight * 0.15),
        margin: 5,
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
        JsBarcode(svgRef.current, "123456789012", {
          format: "CODE128",
          width: 2,
          height: Math.max(40, containerHeight * 0.6),
          displayValue: true,
          fontSize: Math.max(10, containerHeight * 0.15),
          margin: 5,
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
  }, [content, size])

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center" 
      style={{ 
        transform: `rotate(${rotation}deg)`,
        minHeight: '60px'
      }}
    >
      <svg ref={svgRef} className="max-w-full max-h-full" style={{ display: 'block' }} />
    </div>
  )
}

export default BarcodeElement

