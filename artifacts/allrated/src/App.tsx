import { useCallback, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { AppScreen } from './components/AppScreen';
import { DetailModal } from './components/DetailModal';
import { SavedPanel } from './components/SavedPanel';
import { Toast } from './components/Toast';
import { useAppHistory } from './hooks/useAppHistory';
import { useToast } from './hooks/useToast';
import { useUserData } from './context/userDataContext';
import { categoryData } from './data/catalog';
import type { Item } from './data/catalog';
import { decodeId } from './api/ids';

function App() {
  const { state, navigate, back } = useAppHistory();
  const { message, show } = useToast();
  const { authReady, user, watchlist } = useUserData();

  useEffect(() => {
    if (!authReady) return;
    if (user && state.screen === 'auth') {
      navigate({ screen: 'app', category: 'movie' });
    }
  }, [authReady, user, state.screen, navigate]);

  const openItem = useCallback(
    (item: Item) => {
      const cat = state.screen === 'app' && state.category ? state.category : 'movie';
      navigate({ screen: 'app', category: cat, modal: item.id });
    },
    [navigate, state],
  );

  const openSaved = useCallback(() => {
    const cat = state.screen === 'app' && state.category ? state.category : 'movie';
    navigate({ screen: 'app', category: cat, panel: 'saved' });
  }, [navigate, state]);

  const closeModal = useCallback(() => back(), [back]);
  const closeSavedPanel = useCallback(() => back(), [back]);

  const modalAccent =
    state.modal != null
      ? categoryData[decodeId(state.modal).mediaType].accent
      : categoryData.movie.accent;

  const activeCat = (state.screen === 'app' && state.category) ? state.category : 'movie';

  return (
    <>
      {state.screen === 'auth' && (
        <AuthScreen
          onToast={show}
          onSkip={() => navigate({ screen: 'app', category: 'movie' })}
        />
      )}

      {state.screen !== 'auth' && (
        <AppScreen
          cat={activeCat}
          onBackToCategories={() => {}}
          onOpenItem={openItem}
          onOpenSaved={openSaved}
          onToast={show}
        />
      )}

      {state.screen === 'app' && state.modal != null && (
        <DetailModal
          id={state.modal}
          accent={modalAccent}
          onClose={closeModal}
          onToast={show}
        />
      )}

      {state.screen === 'app' && state.panel === 'saved' && (
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
