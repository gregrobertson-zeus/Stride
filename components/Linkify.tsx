'use client'

import { ReactNode } from 'react'

interface Props {
  text: string
  className?: string
}

const URL_REGEX = /(https?:\/\/[^\s<]+[^\s<.,;:!?"')}\]])/g

export function Linkify({ text, className }: Props): ReactNode {
  const parts = text.split(URL_REGEX)

  if (parts.length === 1) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (URL_REGEX.test(part)) {
          // Reset lastIndex since we're reusing the regex
          URL_REGEX.lastIndex = 0
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                color: 'var(--accent)',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
            >
              {part}
            </a>
          )
        }
        return part
      })}
    </span>
  )
}
