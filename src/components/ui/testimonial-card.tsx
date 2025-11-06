import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

export interface TestimonialAuthor {
  name: string
  title: string
  avatar: string
}

interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({ author, text, href, className }: TestimonialCardProps) {
  const CardWrapper = href ? "a" : "div"
  
  return (
    <CardWrapper
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 w-[350px] hover:shadow-lg transition-shadow duration-300",
        href && "cursor-pointer",
        className
      )}
    >
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
        ))}
      </div>
      
      <p className="text-sm text-foreground leading-relaxed">
        {text}
      </p>
      
      <div className="flex items-center gap-3 mt-auto">
        <img
          src={author.avatar}
          alt={author.name}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {author.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {author.title}
          </span>
        </div>
      </div>
    </CardWrapper>
  )
}