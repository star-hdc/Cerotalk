import React from 'react';

interface HashtagTextProps {
  text: string;
  className?: string;
  hashtagClassName?: string;
}

const HASHTAG_PATTERN = /#[\p{L}\p{N}_]+/gu;

export default function HashtagText({
  text,
  className,
  hashtagClassName = 'font-bold text-[#32f5a7]'
}: HashtagTextProps) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(HASHTAG_PATTERN)) {
    const hashtag = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <span key={`${hashtag}-${index}`} className={hashtagClassName}>
        {hashtag}
      </span>
    );

    lastIndex = index + hashtag.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}
