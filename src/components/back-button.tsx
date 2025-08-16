'use client';

import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

const BackButton = () => {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()}>
      Voltar
    </Button>
  );
};

export default BackButton;
