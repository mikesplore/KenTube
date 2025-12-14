import AIAssistantPage from './ai-assistant/page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kenya Tube Insights | AI Assistant',
  description: 'Focused on Kenyan YouTube data via AI.',
};

export default function Home() {
  return <AIAssistantPage />;
}
