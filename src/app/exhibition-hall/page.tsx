"use client";

import dynamic from 'next/dynamic';

const ExhibitionHallViewer = dynamic(
  () => import('@/components/ExhibitionHallViewer'),
  { ssr: false }
);

export default function ExhibitionHallPage() {
  return (
    <div className="w-full h-full">
      <ExhibitionHallViewer />
    </div>
  );
} 