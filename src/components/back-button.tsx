'use client';

import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

const BackButton = () => {
  const router = useRouter();

  return (
    <Button onClick={() => router.push('/')}>
      Voltar
    </Button>
  );
};

export default BackButton;
