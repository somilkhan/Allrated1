import { useCallback, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { CategoryScreen } from './components/CategoryScreen';
import { AppScreen } from './components/AppScreen';
import { DetailModal } from './components/DetailModal';
import { SavedPanel } from './components/SavedPanel';
import { Toast } from './components/Toast';
import { useAppHistory } from './hooks/useAppHistory';
import { useToast } from './hooks/useToast';
import { useUserData } from './context/userDataContext';
import { categoryData } from './data/catalog';
import type { CategoryKey, Item } from './data/catalog';
import { decodeId } from './api/ids';

function App() {
  const { state, navigate, back } = useAppHistory();
  const { message, show } = useToast();
  const { authReady, user, watchlist } = useUserData();

  useEffect(() => {
    if (!authReady) return;
    if (user && state.screen === 'auth') {
      navigate({ screen: 'category' });
    } else if (!user && state.screen !== 'auth') {
      navigate({ screen: 'auth' });
    }
  }, [authReady, user, state.screen, navigate]);

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

  const modalAccent =
    state.modal != null
      ? categoryData[decodeId(state.modal).mediaType].accent
      : categoryData.movie.accent;

  return (
    <>
      {state.screen === 'auth' && <AuthScreen onToast={show} />}

      {state.screen === 'category' && <CategoryScreen onPick={handlePickCategory} />}

      {state.screen === 'app' && state.category && (
        <AppScreen
          cat={state.category}
          onBackToCategories={handleBackToCategories}
          onOpenItem={openItem}
          onOpenSaved={openSaved}
          onToast={show}
        />
      )}

      {state.screen === 'app' && state.category && state.modal != null && (
        <DetailModal
          id={state.modal}
          accent={modalAccent}
          onClose={closeModal}
          onToast={show}
        />
      )}

      {state.screen === 'app' && state.category && state.panel === 'saved' && (
        <SavedPanel
          items={watchlist}
          onClose={closeSavedPanel}
          onOpenItem={openItem}
        />
      )}

      <Toast message={message} />
    </>
  );
}

export default App;
