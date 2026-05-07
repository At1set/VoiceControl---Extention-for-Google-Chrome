import { useIsActiveTab } from '@/lib/shared/hooks/useIsActiveTab';

function App() {
	const isActive = useIsActiveTab();
	// console.log(`Инъекция скрипта контента: ${isActive ? 'АКТИВНА' : 'НЕ АКТИВНА'}`);

	if (!isActive) return;
	return <></>;
}

export default App;
