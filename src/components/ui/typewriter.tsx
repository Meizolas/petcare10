import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TypewriterProps {
  text: string[]
  speed?: number
  deleteSpeed?: number
  waitTime?: number
  className?: string
  cursorChar?: string
}

export function Typewriter({
  text,
  speed = 100,
  deleteSpeed = 50,
  waitTime = 2000,
  className,
  cursorChar = "|"
}: TypewriterProps) {
  const [currentText, setCurrentText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    const currentWord = text[currentIndex]
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText !== currentWord) {
          setCurrentText(currentWord.slice(0, currentText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), waitTime)
        }
      } else {
        if (currentText === "") {
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % text.length)
        } else {
          setCurrentText(currentText.slice(0, -1))
        }
      }
    }, isDeleting ? deleteSpeed : speed)

    return () => clearTimeout(timeout)
  }, [currentText, currentIndex, isDeleting, text, speed, deleteSpeed, waitTime])

  return (
    <span className={cn("inline-block", className)}>
      {currentText}
      <span className={cn("transition-opacity", showCursor ? "opacity-100" : "opacity-0")}>
        {cursorChar}
      </span>
    </span>
  )
}
