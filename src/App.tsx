import { useCallback, useMemo } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { CategoryScreen } from './components/CategoryScreen';
import { AppScreen } from './components/AppScreen';
import { DetailModal } from './components/DetailModal';
import { SavedPanel } from './components/SavedPanel';
import { Toast } from './components/Toast';
import { useAppHistory } from './hooks/useAppHistory';
import { useToast } from './hooks/useToast';
import { useSaved } from './hooks/useSaved';
import { categoryData } from './data/catalog';
import type { CategoryKey, Item } from './data/catalog';

function App() {
  const { state, navigate, back } = useAppHistory();
  const { message, show } = useToast();
  const { saved, toggle, isSaved, count } = useSaved();

  const user = useMemo(() => 'User', []);

  const handleAuthed = useCallback(() => {
    navigate({ screen: 'category' });
  }, [navigate]);

  const handlePickCategory = useCallback(
    (cat: CategoryKey) => {
      navigate({ screen: 'app', category: cat });
    },
    [navigate],
  );

  const handleBackToCategories = useCallback(() => {
    navigate({ screen: 'category' });
  }, [navigate]);

  const openItem = useCallback(
    (item: Item) => {
      if (state.screen === 'app' && state.category) {
        navigate({ screen: 'app', category: state.category, modal: item.id });
      }
    },
    [navigate, state],
  );

  const openSaved = useCallback(() => {
    if (state.screen === 'app' && state.category) {
      navigate({ screen: 'app', category: state.category, panel: 'saved' });
    }
  }, [navigate, state]);

  const closeModal = useCallback(() => {
    back();
  }, [back]);

  const closeSavedPanel = useCallback(() => {
    back();
  }, [back]);

  const toggleSave = useCallback(
    (id: number) => {
      const wasSaved = isSaved(id);
      toggle(id);
      show(wasSaved ? 'Removed from saved' : 'Saved to your list');
    },
    [isSaved, toggle, show],
  );

  const activeItem: Item | null = useMemo(() => {
    if (state.screen === 'app' && state.category && state.modal != null) {
      return (
        categoryData[state.category].items.find((i) => i.id === state.modal) ?? null
      );
    }
    return null;
  }, [state]);

  const savedItems: Item[] = useMemo(() => {
    if (!state.category) return [];
    return categoryData[state.category].items.filter((i) => saved.includes(i.id));
  }, [saved, state.category]);

  return (
    <>
      {state.screen === 'auth' && <AuthScreen onAuthed={handleAuthed} />}

      {state.screen === 'category' && <CategoryScreen onPick={handlePickCategory} />}

      {state.screen === 'app' && state.category && (
        <AppScreen
          cat={state.category}
          user={user}
          savedCount={count}
          onBackToCategories={handleBackToCategories}
          onOpenItem={openItem}
          onOpenSaved={openSaved}
          onToast={show}
        />
      )}

      {activeItem && state.category && (
        <DetailModal
          item={activeItem}
          cat={state.category}
          accent={categoryData[state.category].accent}
          saved={isSaved(activeItem.id)}
          onClose={closeModal}
          onToggleSave={() => toggleSave(activeItem.id)}
          onReview={() => show('Review composer coming soon')}
        />
      )}

      {state.screen === 'app' && state.category && state.panel === 'saved' && (
        <SavedPanel
          items={savedItems}
          onClose={closeSavedPanel}
          onOpenItem={openItem}
        />
      )}

      <Toast message={message} />
    </>
  );
}

export default App;
