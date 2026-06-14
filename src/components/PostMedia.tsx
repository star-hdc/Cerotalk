/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Post } from '../types';

interface PostMediaProps {
  post: Post;
  variant?: 'feed' | 'profile';
}

export default function PostMedia({ post, variant = 'feed' }: PostMediaProps) {
  if (!post.mediaUrl || post.mediaType === 'text') return null;

  const isProfile = variant === 'profile';
  const wrapperClassName = isProfile
    ? 'h-28 w-full rounded-lg overflow-hidden bg-zinc-950 border border-zinc-900 mt-2'
    : 'relative mt-3 max-h-[380px] w-full overflow-hidden bg-zinc-950 flex items-center justify-center border-y border-zinc-900 group';

  const mediaClassName = isProfile
    ? 'h-full w-full object-cover'
    : 'w-full max-h-[380px] object-cover transition-transform duration-500 group-hover:scale-[1.02]';

  const videoClassName = isProfile
    ? 'h-full w-full object-cover'
    : 'w-full max-h-[380px] bg-black object-contain';

  return (
    <div id={`post-media-box-${post.id}`} className={wrapperClassName}>
      {post.mediaType === 'video' ? (
        <video
          src={post.mediaUrl}
          className={videoClassName}
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          src={post.mediaUrl}
          alt={post.mediaType === 'gif' ? 'GIF attachment' : 'Post attachment'}
          className={mediaClassName}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
