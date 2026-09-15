import { redirect } from 'next/navigation';

export default function CollectionPage() {
  redirect('/library?tab=collection');
}
