export interface UserSignals {
  timeOnPage: number;
  deviceType: string;
  pagesVisited: number;
  scrollDepth: number;
  firstVisit: boolean;
}

export const collectSignals = (): UserSignals => {
  const startTime = parseInt(sessionStorage.getItem('startTime') || Date.now().toString());
  if (!sessionStorage.getItem('startTime')) {
    sessionStorage.setItem('startTime', startTime.toString());
  }

  const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
  
  let pagesVisited = parseInt(sessionStorage.getItem('pagesVisited') || '0');
  if (pagesVisited === 0) {
      pagesVisited = 1;
      sessionStorage.setItem('pagesVisited', '1');
  }

  const scrollDepth = Math.round(
    ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
  );

  const firstVisit = !localStorage.getItem('returningUser');
  if (firstVisit) {
    localStorage.setItem('returningUser', 'true');
  }

  return {
    timeOnPage,
    deviceType,
    pagesVisited,
    scrollDepth,
    firstVisit,
  };
};

export const incrementPagesVisited = () => {
    let pagesVisited = parseInt(sessionStorage.getItem('pagesVisited') || '0');
    pagesVisited++;
    sessionStorage.setItem('pagesVisited', pagesVisited.toString());
}
