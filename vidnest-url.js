(() => {
  function positive(value,label){const text=String(value).trim();if(!/^[1-9]\d{0,8}$/.test(text))throw Error('Enter a valid '+label+'.');return text}
  function build(kind,id,season,episode){const key=positive(id,'TMDB ID');if(kind==='movie')return 'https://vidnest.fun/movie/'+key;if(kind==='tv')return 'https://vidnest.fun/tv/'+key+'/'+positive(season,'season')+'/'+positive(episode,'episode');throw Error('Choose Movie or TV show.')}
  window.simpleGamesVidNestURL=build;
})();
