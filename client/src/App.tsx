import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Grammar from "./pages/Grammar";
import Vocabulary from "./pages/Vocabulary";
import Kana from "./pages/Kana";
import Practice from "./pages/Practice";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/grammar"} component={Grammar} />
      <Route path={"/vocabulary/nouns"} component={Vocabulary} />
      <Route path={"/vocabulary/verbs"} component={Vocabulary} />
      <Route path={"/kana"} component={Kana} />
      <Route path={"/practice"} component={Practice} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Header />
            <main>
              <Router />
            </main>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
