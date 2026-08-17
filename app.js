(function(){
  /* ---------- slideshow (lazy: only 2 images decoded at a time) ---------- */
  (function(){
    const imgs = window.SLIDESHOW_IMAGES || [];
    const wrap = document.getElementById('slideshow');
    if(!imgs.length) return;
    const elA = document.createElement('img');
    const elB = document.createElement('img');
    elA.src = imgs[0]; elA.className = 'on';
    elA.loading = 'eager'; elB.loading = 'lazy';
    wrap.appendChild(elA); wrap.appendChild(elB);
    let idx = 0, showingA = true;
    setInterval(function(){
      idx = (idx+1) % imgs.length;
      const next = showingA ? elB : elA;
      const cur = showingA ? elA : elB;
      next.src = imgs[idx];
      next.className = 'on';
      cur.className = '';
      showingA = !showingA;
    }, 6000);
  })();

  function makeStars(container, count){
    for(let i=0;i<count;i++){
      const s = document.createElement('div');
      s.className='star';
      const size = 1 + Math.random()*1.8;
      s.style.width=size+'px'; s.style.height=size+'px';
      s.style.top=(Math.random()*100)+'%'; s.style.left=(Math.random()*100)+'%';
      s.style.animationDuration=(2.5+Math.random()*3)+'s';
      s.style.animationDelay=(Math.random()*4)+'s';
      container.appendChild(s);
    }
  }
  makeStars(document.getElementById('starsBg'), 40);

  /* ---------- TOASTS + OFFLINE ---------- */
  function showToast(message, type){
    const stack = document.getElementById('toastStack');
    if(!stack) return;
    const t = document.createElement('div');
    t.className = 'toast' + (type==='error' ? ' error' : '');
    t.textContent = message;
    stack.appendChild(t);
    setTimeout(function(){
      t.style.transition = 'opacity .3s ease';
      t.style.opacity = '0';
      setTimeout(function(){ t.remove(); }, 320);
    }, 3200);
  }
  db.ref('.info/connected').on('value', function(snap){
    const bar = document.getElementById('offlineBar');
    if(!bar) return;
    if(snap.val() === true) bar.classList.remove('show');
    else bar.classList.add('show');
  });

  const loginEl = document.getElementById('login');
  const chatEl = document.getElementById('chat');
  const hiName = document.getElementById('hiName');
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');

  let myName = null;
  let myEmail = null;

  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    loginError.textContent='';
    loginBtn.disabled = true;
    const email = document.getElementById('emailInput').value.trim();
    const pass = document.getElementById('passInput').value;
    auth.signInWithEmailAndPassword(email, pass)
      .catch(function(err){
        loginError.textContent = "That didn't work — check your email & password.";
        loginBtn.disabled = false;
      });
  });

  document.getElementById('logoutBtn').addEventListener('click', function(){
    if(confirm('Log out of Saan?')){
      if(myName){ db.ref('presence/' + myName).set({ online:false, lastSeen: firebase.database.ServerValue.TIMESTAMP }); db.ref('typing/' + myName).set(false); }
      auth.signOut();
    }
  });

  /* ---------------- GAMES ---------------- */
  const gamesHubEl = document.getElementById('gamesHub');
  const tttEl = document.getElementById('ticTacToe');
  const rpsEl = document.getElementById('rpsGame');
  const bingoEl = document.getElementById('bingoGame');
  const flamEl = document.getElementById('flamingo');
  const wpEl = document.getElementById('watchParty');
  const slEl = document.getElementById('snakeLadder');
  const ludoEl = document.getElementById('ludoGame');
  const carromEl = document.getElementById('carromGame');
  const poolEl = document.getElementById('poolGame');
  const blEl = document.getElementById('bucketList');
  const calEl = document.getElementById('calendarScreen');
  const drawEl = document.getElementById('drawingBoard');
  const songsEl = document.getElementById('songsList');
  const wcEl = document.getElementById('wordChain');
  const mgEl = document.getElementById('musicGuess');
  const raceEl = document.getElementById('carRace');
  let tttListenerRef = null;
  let rpsListenerRef = null;
  let bingoListenerRef = null;
  let blListenerRef = null;
  let calListenerRef = null;
  let drawAddedRef = null, drawRemovedRef = null;
  let songsListenerRef = null;
  let wcListenerRef = null;
  let mgListenerRef = null;
  let raceListenerRef = null;
  let flamListenerRef = null;
  let wpListenerRef = null;
  let slListenerRef = null;
  let ludoListenerRef = null;
  let carromListenerRef = null;
  let poolListenerRef = null;

  function closeAllGameScreens(){
    gamesHubEl.classList.remove('show');
    tttEl.classList.remove('show');
    rpsEl.classList.remove('show');
    bingoEl.classList.remove('show');
    blEl.classList.remove('show');
    calEl.classList.remove('show');
    drawEl.classList.remove('show');
    vnEl.classList.remove('show');
    songsEl.classList.remove('show');
    wcEl.classList.remove('show');
    mgEl.classList.remove('show');
    raceEl.classList.remove('show');
    flamEl.classList.remove('show');
    wpEl.classList.remove('show');
    slEl.classList.remove('show');
    ludoEl.classList.remove('show');
    carromEl.classList.remove('show');
    poolEl.classList.remove('show');
    if(tttListenerRef){ tttListenerRef.off('value'); tttListenerRef = null; }
    if(rpsListenerRef){ rpsListenerRef.off('value'); rpsListenerRef = null; }
    if(bingoListenerRef){ bingoListenerRef.off('value'); bingoListenerRef = null; }
    if(blListenerRef){ blListenerRef.off('value'); blListenerRef = null; }
    if(calListenerRef){ calListenerRef.off('value'); calListenerRef = null; }
    if(drawAddedRef){ drawAddedRef.off('child_added'); drawAddedRef = null; }
    if(drawRemovedRef){ drawRemovedRef.off('child_removed'); drawRemovedRef = null; }
    if(vnListenerRef){ vnListenerRef.off('value'); vnListenerRef = null; }
    if(songsListenerRef){ songsListenerRef.off('value'); songsListenerRef = null; }
    if(wcListenerRef){ wcListenerRef.off('value'); wcListenerRef = null; }
    if(mgListenerRef){ mgListenerRef.off('value'); mgListenerRef = null; }
    if(raceListenerRef){ raceListenerRef.off('value'); raceListenerRef = null; }
    if(flamListenerRef){ flamListenerRef.off('value'); flamListenerRef = null; }
    if(wpListenerRef){ wpListenerRef.off('value'); wpListenerRef = null; }
    if(wpReactionsRef){ wpReactionsRef.off('value'); wpReactionsRef = null; }
    if(wpPresenceRef){ wpPresenceRef.off('value'); wpPresenceRef = null; if(myName) db.ref('watchParty/presence/' + myName).set(false); }
    if(wpQueueRef){ wpQueueRef.off('value'); wpQueueRef = null; }
    document.getElementById('wpQueuePanel').classList.remove('show');
    if(wpMiniChatRef){ wpMiniChatRef.off('value'); wpMiniChatRef = null; }
    if(wpMiniChatEl) wpMiniChatEl.classList.remove('show');
    if(wpCdInterval){ clearInterval(wpCdInterval); wpCdInterval = null; }
    if(slListenerRef){ slListenerRef.off('value'); slListenerRef = null; }
    if(ludoListenerRef){ ludoListenerRef.off('value'); ludoListenerRef = null; }
    if(carromListenerRef){ carromListenerRef.off('value'); carromListenerRef = null; }
    if(carromRafId){ cancelAnimationFrame(carromRafId); carromRafId = null; }
    if(poolListenerRef){ poolListenerRef.off('value'); poolListenerRef = null; }
    if(poolRafId){ cancelAnimationFrame(poolRafId); poolRafId = null; }
  }

  /* ---- Streak ---- */
  function dateKey(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function logActivityToday(){
    if(!myName) return;
    db.ref('activity/'+dateKey(new Date())).set(true);
  }
  let streakShowingTotal = false;
  let streakCache = { streak: 0, total: 0 };
  function renderStreakStrip(){
    const el = document.getElementById('streakStrip');
    if(!el) return;
    if(streakShowingTotal){
      el.innerHTML = '<span class="flame">&#10024;</span>' + streakCache.total + ' day' + (streakCache.total===1?'':'s') + ' together on Saan &mdash; tap to see streak';
    } else if(streakCache.streak>0){
      el.innerHTML = '<span class="flame">&#128293;</span>'+streakCache.streak+' day'+(streakCache.streak>1?'s':'')+' streak &mdash; tap for total days';
    } else {
      el.innerHTML = '<span class="flame">&#128293;</span>say something today to start your streak!';
    }
  }
  function updateStreak(){
    db.ref('activity').once('value').then(function(snap){
      const val = snap.val() || {};
      let streak = 0;
      let d = new Date();
      if(!val[dateKey(d)]){
        const y = new Date(d); y.setDate(y.getDate()-1);
        if(!val[dateKey(y)]){ streak = 0; }
      }
      while(val[dateKey(d)]){ streak++; d.setDate(d.getDate()-1); }
      streakCache.streak = streak;
      streakCache.total = Object.keys(val).length;
      streakShowingTotal = false;
      renderStreakStrip();
    });
  }
  document.getElementById('streakStrip').addEventListener('click', function(){
    streakShowingTotal = !streakShowingTotal;
    renderStreakStrip();
    const el = document.getElementById('streakStrip');
    el.style.transform = 'scale(1.04)';
    setTimeout(function(){ el.style.transform = 'scale(1)'; }, 150);
  });

  document.getElementById('gamesBtn').addEventListener('click', function(){
    gamesHubEl.classList.add('show');
    showCategoryHome();
  });
  document.getElementById('gamesCloseBtn').addEventListener('click', closeAllGameScreens);

  /* ---- Universal back-to-hub button (injected into every game screen header) ---- */
  function backToHub(){
    closeAllGameScreens();
    gamesHubEl.classList.add('show');
    showCategoryHome();
  }
  document.querySelectorAll('.gameScreen, #gamesHub').forEach(function(scr){
    scr.setAttribute('role', 'dialog');
    scr.setAttribute('aria-modal', 'true');
  });
  const inCallDialog = document.getElementById('inCall');
  if(inCallDialog){ inCallDialog.setAttribute('role','dialog'); inCallDialog.setAttribute('aria-modal','true'); }
  const incomingCallDialog = document.getElementById('incomingCall');
  if(incomingCallDialog){ incomingCallDialog.setAttribute('role','dialog'); incomingCallDialog.setAttribute('aria-modal','true'); }

  document.querySelectorAll('.gameScreen .ghHdr').forEach(function(hdr){
    if(hdr.querySelector('.backToHubBtn')) return;
    const backBtn = document.createElement('button');
    backBtn.className = 'iconBtn backToHubBtn';
    backBtn.innerHTML = '&#8249;';
    backBtn.title = 'Back';
    backBtn.setAttribute('aria-label', 'Back');
    backBtn.addEventListener('click', backToHub);
    hdr.insertBefore(backBtn, hdr.firstChild);
  });

  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    if(document.getElementById('inCall').classList.contains('show')){ return; }
    const openScreen = document.querySelector('.gameScreen.show');
    if(openScreen){ backToHub(); return; }
    if(gamesHubEl.classList.contains('show')){ closeAllGameScreens(); }
  });
  document.getElementById('tttCloseBtn').addEventListener('click', closeAllGameScreens);
  document.getElementById('rpsCloseBtn').addEventListener('click', closeAllGameScreens);

  /* ---- Category navigation ---- */
  const categoryListEl = document.getElementById('categoryList');
  const catBackBtn = document.getElementById('catBackBtn');
  const ghTitleEl = document.getElementById('ghTitle');
  const CAT_TITLES = { games:'Games & Fun', watch:'Watch Together', music:'Our Music', planner:'Our Planner', creative:'Creative Corner' };

  function showCategoryHome(){
    categoryListEl.style.display = 'flex';
    document.querySelectorAll('.catSection').forEach(function(s){ s.style.display = 'none'; });
    catBackBtn.style.visibility = 'hidden';
    ghTitleEl.textContent = 'Together';
    document.getElementById('streakStrip').style.display = 'block';
    updateStreak();
  }
  function showCategory(cat){
    categoryListEl.style.display = 'none';
    document.querySelectorAll('.catSection').forEach(function(s){ s.style.display = 'none'; });
    document.getElementById('cat-' + cat).style.display = 'flex';
    catBackBtn.style.visibility = 'visible';
    ghTitleEl.textContent = CAT_TITLES[cat] || 'Together';
    document.getElementById('streakStrip').style.display = 'none';
  }
  document.querySelectorAll('.catCard[data-cat]').forEach(function(card){
    card.addEventListener('click', function(){ showCategory(card.getAttribute('data-cat')); });
  });
  catBackBtn.addEventListener('click', showCategoryHome);

  document.querySelectorAll('.ghCard[data-game]').forEach(function(card){
    card.addEventListener('click', function(){
      const game = card.getAttribute('data-game');
      gamesHubEl.classList.remove('show');
      if(game === 'tictactoe'){ openTicTacToe(); }
      else if(game === 'rps'){ openRps(); }
      else if(game === 'bingo'){ openBingo(); }
      else if(game === 'bucketlist'){ openBucketList(); }
      else if(game === 'calendar'){ openCalendar(); }
      else if(game === 'drawing'){ openDrawing(); }
      else if(game === 'songs'){ openSongs(); }
      else if(game === 'wordchain'){ openWordChain(); }
      else if(game === 'musicguess'){ openMusicGuess(); }
      else if(game === 'race'){ openRace(); }
      else if(game === 'flamingo'){ openFlamingo(); }
      else if(game === 'watchparty'){ openWatchParty(); }
      else if(game === 'snakeladder'){ openSnakeLadder(); }
      else if(game === 'ludo'){ openLudo(); }
      else if(game === 'carrom'){ openCarrom(); }
      else if(game === 'pool'){ openPool(); }
      else if(game === 'voicenotes'){ openVoiceNotes(); }
    });
  });

  /* ---- Tic Tac Toe ---- */
  const tttStatusEl = document.getElementById('tttStatus');
  const tttBoardEl = document.getElementById('tttBoard');
  let tttSoloMode = false;
  let tttSoloBoard = ['','','','','','','','',''];
  let tttSoloWinner = null;

  function mySymbol(){ return myName === 'Sahil' ? 'X' : 'O'; }
  function theirSymbol(){ return myName === 'Sahil' ? 'O' : 'X'; }

  function openTicTacToe(){
    tttEl.classList.add('show');
    tttSetMode(false);
  }

  document.getElementById('tttModeTogether').addEventListener('click', function(){ tttSetMode(false); });
  document.getElementById('tttModeSolo').addEventListener('click', function(){ tttSetMode(true); });

  function tttSetMode(solo){
    tttSoloMode = solo;
    document.getElementById('tttModeTogether').classList.toggle('active', !solo);
    document.getElementById('tttModeSolo').classList.toggle('active', solo);
    if(tttListenerRef){ tttListenerRef.off('value'); tttListenerRef = null; }
    if(solo){
      tttSoloBoard = ['','','','','','','','',''];
      tttSoloWinner = null;
      tttRenderSolo();
    } else {
      const ref = db.ref('games/tictactoe');
      tttListenerRef = ref;
      ref.once('value').then(function(snap){
        if(!snap.exists()){
          ref.set({ board: ['','','','','','','','',''], turn: 'X', winner: null });
        }
      });
      ref.on('value', function(snap){
        const state = snap.val();
        if(!state) return;
        renderTtt(state);
      });
    }
  }

  function tttWinner(board){
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,b,c] of lines){
      if(board[a] && board[a]===board[b] && board[b]===board[c]) return board[a];
    }
    if(board.every(function(c){ return c; })) return 'draw';
    return null;
  }

  /* Minimax — unbeatable computer opponent for solo play */
  function tttMinimax(board, isMaximizing){
    const w = tttWinner(board);
    if(w === 'O') return 10;
    if(w === 'X') return -10;
    if(w === 'draw') return 0;
    if(isMaximizing){
      let best = -Infinity;
      board.forEach(function(c,i){ if(!c){ board[i]='O'; best = Math.max(best, tttMinimax(board,false)); board[i]=''; } });
      return best;
    } else {
      let best = Infinity;
      board.forEach(function(c,i){ if(!c){ board[i]='X'; best = Math.min(best, tttMinimax(board,true)); board[i]=''; } });
      return best;
    }
  }
  function tttComputerMove(board){
    let bestScore = -Infinity, bestMove = -1;
    board.forEach(function(c,i){
      if(!c){
        board[i]='O';
        const score = tttMinimax(board, false);
        board[i]='';
        if(score > bestScore){ bestScore = score; bestMove = i; }
      }
    });
    return bestMove;
  }

  function tttRenderSolo(){
    tttBoardEl.innerHTML = '';
    tttSoloBoard.forEach(function(cell, i){
      const div = document.createElement('div');
      div.className = 'tttCell' + (cell==='X' ? ' x' : cell==='O' ? ' o' : '');
      div.textContent = cell;
      div.addEventListener('click', function(){
        if(tttSoloWinner || cell) return;
        tttSoloBoard[i] = 'X';
        tttSoloWinner = tttWinner(tttSoloBoard);
        if(!tttSoloWinner){
          const move = tttComputerMove(tttSoloBoard);
          if(move !== -1) tttSoloBoard[move] = 'O';
          tttSoloWinner = tttWinner(tttSoloBoard);
        }
        tttRenderSolo();
      });
      tttBoardEl.appendChild(div);
    });
    if(tttSoloWinner === 'draw'){ tttStatusEl.textContent = "It's a draw!"; }
    else if(tttSoloWinner === 'X'){ tttStatusEl.textContent = 'You won! 🎉'; }
    else if(tttSoloWinner === 'O'){ tttStatusEl.textContent = 'Computer won — try again!'; }
    else { tttStatusEl.textContent = 'Your turn (you are X)'; }
  }

  function renderTtt(state){
    tttBoardEl.innerHTML = '';
    state.board.forEach(function(cell, i){
      const div = document.createElement('div');
      div.className = 'tttCell' + (cell==='X' ? ' x' : cell==='O' ? ' o' : '');
      div.textContent = cell;
      div.addEventListener('click', function(){
        if(state.winner || cell || state.turn !== mySymbol()) return;
        const newBoard = state.board.slice();
        newBoard[i] = mySymbol();
        const w = tttWinner(newBoard);
        db.ref('games/tictactoe').update({
          board: newBoard,
          turn: theirSymbol(),
          winner: w
        });
      });
      tttBoardEl.appendChild(div);
    });
    if(state.winner === 'draw'){ tttStatusEl.textContent = "It's a draw!"; }
    else if(state.winner){
      tttStatusEl.textContent = (state.winner === mySymbol()) ? 'You won! 🎉' : (otherPersonName() + ' won');
    } else {
      tttStatusEl.textContent = (state.turn === mySymbol()) ? 'Your turn' : (otherPersonName() + "'s turn");
    }
  }

  document.getElementById('tttResetBtn').addEventListener('click', function(){
    if(tttSoloMode){
      tttSoloBoard = ['','','','','','','','',''];
      tttSoloWinner = null;
      tttRenderSolo();
    } else {
      db.ref('games/tictactoe').set({ board: ['','','','','','','','',''], turn: 'X', winner: null });
    }
  });

  /* ---- Rock Paper Scissors ---- */
  const rpsStatusEl = document.getElementById('rpsStatus');
  const rpsScoreEl = document.getElementById('rpsScore');
  const rpsRevealEl = document.getElementById('rpsReveal');

  function openRps(){
    rpsEl.classList.add('show');
    const ref = db.ref('games/rps');
    rpsListenerRef = ref;
    ref.once('value').then(function(snap){
      if(!snap.exists()){
        ref.set({ choices: { Sahil: null, Ananya: null }, score: { Sahil: 0, Ananya: 0 } });
      }
    });
    ref.on('value', function(snap){
      const state = snap.val();
      if(!state) return;
      renderRps(state);
    });
  }

  function rpsOutcome(a, b){
    if(a === b) return 'draw';
    const beats = { rock:'scissors', paper:'rock', scissors:'paper' };
    return beats[a] === b ? 'a' : 'b';
  }

  function renderRps(state){
    const choices = state.choices || {};
    const score = state.score || { Sahil:0, Ananya:0 };
    rpsScoreEl.textContent = 'Sahil ' + (score.Sahil||0) + '  —  ' + (score.Ananya||0) + ' Ananya';

    document.querySelectorAll('.rpsBtn').forEach(function(btn){
      btn.classList.toggle('picked', choices[myName] === btn.getAttribute('data-choice'));
    });

    const mine = choices[myName];
    const theirs = choices[otherPersonName()];

    if(mine && theirs){
      const result = rpsOutcome(choices.Sahil, choices.Ananya);
      const iconOf = { rock:'✊', paper:'✋', scissors:'✌️' };
      let line = 'Sahil ' + iconOf[choices.Sahil] + '  vs  ' + iconOf[choices.Ananya] + ' Ananya — ';
      if(result === 'draw'){ line += "it's a draw!"; }
      else {
        const winnerName = (result === 'a') ? 'Sahil' : 'Ananya';
        line += winnerName + ' wins this round!';
      }
      rpsRevealEl.textContent = line;
      rpsStatusEl.textContent = 'Tap "New round" to play again';

      if(result !== 'draw' && !state.scored){
        const winnerName2 = (result === 'a') ? 'Sahil' : 'Ananya';
        db.ref('games/rps/scored').transaction(function(cur){
          if(cur) return; // already scored by the other client — abort
          return true;
        }, function(err, committed){
          if(committed){
            db.ref('games/rps/score/' + winnerName2).transaction(function(v){ return (v||0) + 1; });
          }
        });
      }
    } else if(mine){
      rpsRevealEl.textContent = '';
      rpsStatusEl.textContent = 'Waiting for ' + otherPersonName() + '...';
    } else {
      rpsRevealEl.textContent = '';
      rpsStatusEl.textContent = 'Pick your move';
    }
  }

  document.querySelectorAll('.rpsBtn').forEach(function(btn){
    btn.addEventListener('click', function(){
      db.ref('games/rps/choices/' + myName).set(btn.getAttribute('data-choice'));
    });
  });

  document.getElementById('rpsResetBtn').addEventListener('click', function(){
    db.ref('games/rps').update({ choices: { Sahil: null, Ananya: null }, scored: false });
  });

  /* ---- Bingo ---- */
  const bingoStatusEl = document.getElementById('bingoStatus');
  const bingoBoardEl = document.getElementById('bingoBoard');

  function shuffledNumbers(){
    const arr = Array.from({length:25}, function(_,i){ return i+1; });
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]] = [arr[j],arr[i]];
    }
    return arr;
  }

  function openBingo(){
    bingoEl.classList.add('show');
    const ref = db.ref('games/bingo');
    bingoListenerRef = ref;
    ref.once('value').then(function(snap){
      if(!snap.exists()){
        ref.set({ board: shuffledNumbers(), marked: new Array(25).fill(false), winner: false });
      }
    });
    ref.on('value', function(snap){
      const state = snap.val();
      if(!state) return;
      renderBingo(state);
    });
  }

  function bingoCheckWin(marked){
    for(let r=0;r<5;r++){ if([0,1,2,3,4].every(function(c){ return marked[r*5+c]; })) return true; }
    for(let c=0;c<5;c++){ if([0,1,2,3,4].every(function(r){ return marked[r*5+c]; })) return true; }
    if([0,6,12,18,24].every(function(i){ return marked[i]; })) return true;
    if([4,8,12,16,20].every(function(i){ return marked[i]; })) return true;
    return false;
  }

  function renderBingo(state){
    bingoBoardEl.innerHTML = '';
    state.board.forEach(function(num, i){
      const cell = document.createElement('div');
      cell.className = 'bingoCell' + (state.marked[i] ? ' marked' : '');
      cell.textContent = num;
      cell.addEventListener('click', function(){
        if(state.winner) return;
        db.ref('games/bingo/marked').transaction(function(currentMarked){
          const arr = (currentMarked || state.marked).slice();
          arr[i] = !arr[i];
          return arr;
        }, function(err, committed, snap){
          if(committed && snap){
            const arr = snap.val();
            if(bingoCheckWin(arr)) db.ref('games/bingo/winner').set(true);
          }
        });
      });
      bingoBoardEl.appendChild(cell);
    });
    bingoStatusEl.textContent = state.winner ? 'BINGO! You both win! 🎉' : 'Mark numbers together to complete a line';
  }

  document.getElementById('bingoResetBtn').addEventListener('click', function(){
    db.ref('games/bingo').set({ board: shuffledNumbers(), marked: new Array(25).fill(false), winner: false });
  });

  /* ---- Bucket List ---- */
  const blListEl = document.getElementById('blList');
  const blInput = document.getElementById('blInput');

  function openBucketList(){
    blEl.classList.add('show');
    const ref = db.ref('bucketList');
    blListenerRef = ref;
    ref.on('value', renderBucketList);
  }

  function renderBucketList(snap){
    const val = snap.val();
    blListEl.innerHTML = '';
    if(!val){
      blListEl.innerHTML = '<div id="vnEmpty">No dreams added yet — add your first one 💫</div>';
      return;
    }
    const entries = Object.keys(val).map(function(k){ return Object.assign({id:k}, val[k]); });
    entries.sort(function(a,b){ if(!!a.done !== !!b.done) return a.done ? 1 : -1; return (a.ts||0)-(b.ts||0); });
    entries.forEach(function(item){
      const row = document.createElement('div');
      row.className = 'blItem' + (item.done ? ' done' : '');
      const check = document.createElement('div');
      check.className = 'blCheck';
      check.textContent = item.done ? '✓' : '';
      check.addEventListener('click', function(){
        db.ref('bucketList/' + item.id + '/done').set(!item.done);
      });
      const text = document.createElement('div');
      text.className = 'blText';
      text.textContent = item.text;
      const del = document.createElement('button');
      del.className = 'blDel';
      del.textContent = '🗑';
      del.addEventListener('click', function(){ if(confirm('Remove this from the bucket list?')) db.ref('bucketList/' + item.id).remove(); });
      row.appendChild(check); row.appendChild(text); row.appendChild(del);
      blListEl.appendChild(row);
    });
  }

  function addBucketItem(){
    const text = blInput.value.trim();
    if(!text) return;
    db.ref('bucketList').push({ text: text, done: false, addedBy: myName, ts: firebase.database.ServerValue.TIMESTAMP });
    blInput.value = '';
  }
  document.getElementById('blAddBtn').addEventListener('click', addBucketItem);
  blInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') addBucketItem(); });

  /* ---- Calendar / Reminders ---- */
  const calListEl = document.getElementById('calList');
  const calTitleInput = document.getElementById('calTitle');
  const calDateInput = document.getElementById('calDate');

  function openCalendar(){
    calEl.classList.add('show');
    const ref = db.ref('reminders');
    calListenerRef = ref;
    ref.on('value', renderCalendar);
  }

  function reminderSub(ms){
    const diff = ms - Date.now();
    const d = new Date(ms);
    const dateStr = d.toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' }) +
      ', ' + d.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });
    if(diff < 0) return dateStr + ' · passed';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if(days > 0) return dateStr + ' · in ' + days + 'd';
    if(hours > 0) return dateStr + ' · in ' + hours + 'h';
    return dateStr + ' · soon';
  }

  function renderCalendar(snap){
    const val = snap.val();
    calListEl.innerHTML = '';
    if(!val){
      calListEl.innerHTML = '<div id="vnEmpty">No reminders yet — add one below</div>';
      return;
    }
    const entries = Object.keys(val).map(function(k){ return Object.assign({id:k}, val[k]); });
    entries.sort(function(a,b){ return (a.when||0)-(b.when||0); });
    entries.forEach(function(item){
      const row = document.createElement('div');
      row.className = 'calItem';
      const meta = document.createElement('div');
      meta.className = 'calMeta';
      meta.innerHTML = '<div class="calTitle">' + item.title + '</div><div class="calSub">' + reminderSub(item.when) + ' · added by ' + item.addedBy + '</div>';
      const del = document.createElement('button');
      del.className = 'calDel';
      del.textContent = '🗑';
      del.addEventListener('click', function(){ if(confirm('Delete this reminder?')) db.ref('reminders/' + item.id).remove(); });
      row.appendChild(meta); row.appendChild(del);
      calListEl.appendChild(row);
    });
  }

  document.getElementById('calAddBtn').addEventListener('click', function(){
    const title = calTitleInput.value.trim();
    const dateVal = calDateInput.value;
    if(!title || !dateVal) return;
    const when = new Date(dateVal).getTime();
    db.ref('reminders').push({ title: title, when: when, addedBy: myName, ts: firebase.database.ServerValue.TIMESTAMP });
    calTitleInput.value = ''; calDateInput.value = '';
  });

  /* ---- Drawing Board ---- */
  const drawCanvas = document.getElementById('drawCanvas');
  const drawCtx = drawCanvas.getContext('2d');
  let drawColor = '#d9b378';
  let drawing = false;
  let currentStroke = [];

  document.querySelectorAll('.drawColor').forEach(function(btn, idx){
    if(idx===0) btn.classList.add('active');
    btn.addEventListener('click', function(){
      document.querySelectorAll('.drawColor').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      drawColor = btn.getAttribute('data-color');
    });
  });

  function sizeCanvas(){
    const rect = drawCanvas.getBoundingClientRect();
    drawCanvas.width = rect.width;
    drawCanvas.height = rect.height;
  }

  function drawStrokeOnCanvas(stroke){
    if(!stroke.points || stroke.points.length < 2) return;
    drawCtx.strokeStyle = stroke.color || '#d9b378';
    drawCtx.lineWidth = 3;
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.beginPath();
    stroke.points.forEach(function(p, i){
      const x = p[0] * drawCanvas.width, y = p[1] * drawCanvas.height;
      if(i===0) drawCtx.moveTo(x,y); else drawCtx.lineTo(x,y);
    });
    drawCtx.stroke();
  }

  let drawStrokesMap = {};
  function redrawAllStrokes(){
    drawCtx.clearRect(0,0,drawCanvas.width,drawCanvas.height);
    Object.keys(drawStrokesMap).forEach(function(k){ drawStrokeOnCanvas(drawStrokesMap[k]); });
  }

  function openDrawing(){
    drawEl.classList.add('show');
    sizeCanvas();
    drawStrokesMap = {};
    drawCtx.clearRect(0,0,drawCanvas.width,drawCanvas.height);
    const ref = db.ref('drawing/strokes');
    drawAddedRef = ref; drawRemovedRef = ref;
    ref.on('child_added', function(snap){
      drawStrokesMap[snap.key] = snap.val();
      drawStrokeOnCanvas(snap.val());
    });
    ref.on('child_removed', function(snap){
      delete drawStrokesMap[snap.key];
      redrawAllStrokes();
    });
  }

  function drawPos(e){
    const rect = drawCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e){
    drawing = true;
    currentStroke = [];
    const p = drawPos(e);
    currentStroke.push([p.x/drawCanvas.width, p.y/drawCanvas.height]);
  }
  function moveDraw(e){
    if(!drawing) return;
    const p = drawPos(e);
    const prev = currentStroke[currentStroke.length-1];
    currentStroke.push([p.x/drawCanvas.width, p.y/drawCanvas.height]);
    drawCtx.strokeStyle = drawColor;
    drawCtx.lineWidth = 3;
    drawCtx.lineCap = 'round';
    drawCtx.beginPath();
    drawCtx.moveTo(prev[0]*drawCanvas.width, prev[1]*drawCanvas.height);
    drawCtx.lineTo(p.x, p.y);
    drawCtx.stroke();
  }
  function endDraw(){
    if(!drawing) return;
    drawing = false;
    if(currentStroke.length > 1){
      db.ref('drawing/strokes').push({ points: currentStroke, color: drawColor, addedBy: myName });
    }
    currentStroke = [];
  }

  drawCanvas.addEventListener('mousedown', startDraw);
  drawCanvas.addEventListener('mousemove', moveDraw);
  drawCanvas.addEventListener('mouseup', endDraw);
  drawCanvas.addEventListener('mouseleave', endDraw);
  drawCanvas.addEventListener('touchstart', function(e){ e.preventDefault(); startDraw(e); });
  drawCanvas.addEventListener('touchmove', function(e){ e.preventDefault(); moveDraw(e); });
  drawCanvas.addEventListener('touchend', function(e){ e.preventDefault(); endDraw(); });

  document.getElementById('drawClearBtn').addEventListener('click', function(){
    if(confirm('Clear the whole drawing?')) db.ref('drawing/strokes').remove();
  });

  document.getElementById('bingoCloseBtn').addEventListener('click', closeAllGameScreens);
  document.getElementById('blCloseBtn').addEventListener('click', closeAllGameScreens);
  document.getElementById('calCloseBtn').addEventListener('click', closeAllGameScreens);
  document.getElementById('drawCloseBtn').addEventListener('click', closeAllGameScreens);
  document.getElementById('songsCloseBtn').addEventListener('click', closeAllGameScreens);
  document.getElementById('wcCloseBtn').addEventListener('click', closeAllGameScreens);
  document.getElementById('mgCloseBtn').addEventListener('click', closeAllGameScreens);
  document.getElementById('raceCloseBtn').addEventListener('click', closeAllGameScreens);

  /* ---- Songs List (Spotify embeds) ---- */
  const songsListEl = document.getElementById('songsListEl');
  const songTitleInput = document.getElementById('songTitleInput');

  function openSongs(){
    songsEl.classList.add('show');
    const ref = db.ref('songs');
    songsListenerRef = ref;
    ref.on('value', renderSongs);
  }

  function parseSpotifyLink(url){
    const m = url.match(/open\.spotify\.com\/(track|playlist|album|episode|show)\/([a-zA-Z0-9]+)/);
    if(!m) return null;
    return { type: m[1], id: m[2] };
  }

  function renderSongs(snap){
    const val = snap.val();
    songsListEl.innerHTML = '';
    if(!val){ songsListEl.innerHTML = '<div id="vnEmpty">No songs yet — paste a Spotify link below 🎵</div>'; return; }
    const entries = Object.keys(val).map(function(k){ return Object.assign({id:k}, val[k]); });
    entries.sort(function(a,b){ return (b.ts||0)-(a.ts||0); });
    entries.forEach(function(item){
      const card = document.createElement('div');
      card.className = 'songCard';
      const hdr = document.createElement('div');
      hdr.className = 'songCardHdr';
      hdr.innerHTML = '<span>' + (item.type==='playlist'?'📀 Playlist':'🎵 Track') + ' · added by ' + item.addedBy + '</span>';
      const del = document.createElement('button');
      del.className = 'songDel'; del.textContent = '🗑';
      del.addEventListener('click', function(){ if(confirm('Remove this song from the playlist?')) db.ref('songs/' + item.id).remove(); });
      hdr.appendChild(del);
      const iframe = document.createElement('iframe');
      iframe.src = 'https://open.spotify.com/embed/' + item.spotifyType + '/' + item.spotifyId + '?utm_source=generator&theme=0';
      iframe.height = (item.spotifyType === 'track') ? 152 : 352;
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      iframe.loading = 'lazy';
      card.appendChild(hdr);
      card.appendChild(iframe);
      songsListEl.appendChild(card);
    });
  }

  function addSong(){
    const url = songTitleInput.value.trim();
    if(!url) return;
    const parsed = parseSpotifyLink(url);
    if(!parsed){
      showToast("That doesn't look like a Spotify link. Open Spotify → Share → Copy link.", 'error');
      return;
    }
    db.ref('songs').push({
      spotifyType: parsed.type, spotifyId: parsed.id,
      addedBy: myName, ts: firebase.database.ServerValue.TIMESTAMP
    });
    songTitleInput.value = '';
  }
  document.getElementById('songAddBtn').addEventListener('click', addSong);
  songTitleInput.addEventListener('keydown', function(e){ if(e.key==='Enter') addSong(); });

  /* ---- Word Chain ---- */
  const wcStatusEl = document.getElementById('wcStatus');
  const wcChainEl = document.getElementById('wcChain');
  const wcInput = document.getElementById('wcInput');

  function openWordChain(){
    wcEl.classList.add('show');
    const ref = db.ref('games/wordchain');
    wcListenerRef = ref;
    ref.once('value').then(function(snap){
      if(!snap.exists()){ ref.set({ words: [], turn: 'Sahil' }); }
    });
    ref.on('value', function(snap){
      const state = snap.val();
      if(!state) return;
      renderWordChain(state);
    });
  }
  function renderWordChain(state){
    const words = state.words || [];
    wcChainEl.innerHTML = '';
    words.forEach(function(w){
      const span = document.createElement('div');
      span.className = 'wcWord';
      span.innerHTML = w.word + '<span class="wcBy">' + w.by + '</span>';
      wcChainEl.appendChild(span);
    });
    wcStatusEl.textContent = (state.turn === myName) ? 'Your turn' : (otherPersonName() + "'s turn");
  }
  function submitWord(){
    db.ref('games/wordchain').once('value').then(function(snap){
      const state = snap.val() || { words: [], turn: 'Sahil' };
      if(state.turn !== myName){ showToast("It's " + otherPersonName() + "'s turn", 'error'); return; }
      const word = wcInput.value.trim().toLowerCase();
      if(!word) return;
      const words = state.words || [];
      const lastWord = words.length ? words[words.length-1].word : null;
      if(lastWord && word[0] !== lastWord[lastWord.length-1]){
        showToast('Word must start with "' + lastWord[lastWord.length-1].toUpperCase() + '"', 'error');
        return;
      }
      if(words.some(function(w){ return w.word === word; })){
        showToast('Word already used!', 'error');
        return;
      }
      words.push({ word: word, by: myName });
      db.ref('games/wordchain').update({ words: words, turn: otherPersonName() });
      wcInput.value = '';
    });
  }
  document.getElementById('wcAddBtn').addEventListener('click', submitWord);
  wcInput.addEventListener('keydown', function(e){ if(e.key==='Enter') submitWord(); });

  /* ---- Music Guess ---- */
  const mgBodyEl = document.getElementById('mgBody');

  function openMusicGuess(){
    mgEl.classList.add('show');
    const ref = db.ref('games/musicGuess');
    mgListenerRef = ref;
    ref.once('value').then(function(snap){
      if(!snap.exists()){ ref.set({ round: 1, title: '', hint: '', guesses: {}, solved: false }); }
    });
    ref.on('value', function(snap){
      const state = snap.val();
      if(!state) return;
      renderMusicGuess(state);
    });
  }
  function renderMusicGuess(state){
    const setterName = (state.round % 2 === 1) ? 'Sahil' : 'Ananya';
    const iAmSetter = (myName === setterName);
    mgBodyEl.innerHTML = '';

    if(!state.title){
      if(iAmSetter){
        mgBodyEl.innerHTML =
          '<div class="calSub">Round ' + state.round + ' — pick a song, ' + myName + '!</div>' +
          '<input id="mgTitleIn" type="text" placeholder="Secret song title" />' +
          '<input id="mgHintIn" type="text" placeholder="Hint for ' + otherPersonName() + '" />' +
          '<button id="mgStartBtn">Start round</button>';
        document.getElementById('mgStartBtn').addEventListener('click', function(){
          const title = document.getElementById('mgTitleIn').value.trim();
          const hint = document.getElementById('mgHintIn').value.trim();
          if(!title) return;
          db.ref('games/musicGuess').update({ title: title, hint: hint, guesses: {}, solved: false });
        });
      } else {
        mgBodyEl.innerHTML = '<div class="calSub">Waiting for ' + setterName + ' to pick a song...</div>';
      }
      return;
    }

    if(state.solved){
      mgBodyEl.innerHTML =
        '<div class="calSub">🎉 It was: <b>' + state.title + '</b></div>' +
        '<button id="mgNextBtn">Next round</button>';
      document.getElementById('mgNextBtn').addEventListener('click', function(){
        db.ref('games/musicGuess').set({ round: state.round + 1, title: '', hint: '', guesses: {}, solved: false });
      });
      return;
    }

    const guesses = state.guesses ? Object.keys(state.guesses).map(function(k){ return Object.assign({id:k}, state.guesses[k]); }) : [];
    guesses.sort(function(a,b){ return (a.ts||0)-(b.ts||0); });

    let html = '<div class="calSub">Hint: ' + (state.hint || '(no hint)') + '</div>';
    if(!iAmSetter){
      html += '<input id="mgGuessIn" type="text" placeholder="Your guess..." /><button id="mgGuessBtn">Submit guess</button>';
    }
    mgBodyEl.innerHTML = html;

    guesses.forEach(function(g){
      const row = document.createElement('div');
      row.className = 'mgGuessRow';
      row.innerHTML = '<span>' + g.by + ': ' + g.text + '</span>';
      if(iAmSetter){
        const btn = document.createElement('button');
        btn.className = 'mgCorrectBtn';
        btn.textContent = 'Correct!';
        btn.addEventListener('click', function(){ db.ref('games/musicGuess/solved').set(true); });
        row.appendChild(btn);
      }
      mgBodyEl.appendChild(row);
    });

    if(!iAmSetter){
      document.getElementById('mgGuessBtn').addEventListener('click', function(){
        const val = document.getElementById('mgGuessIn').value.trim();
        if(!val) return;
        db.ref('games/musicGuess/guesses').push({ by: myName, text: val, ts: firebase.database.ServerValue.TIMESTAMP });
      });
    }
  }

  /* ---- Car Race (canvas physics racer) ---- */
  const raceStatusEl = document.getElementById('raceStatus');
  const raceCanvas = document.getElementById('raceCanvas');
  const raceCtx = raceCanvas.getContext('2d');
  const raceMySpeedEl = document.getElementById('raceMySpeed');
  const raceOppSpeedEl = document.getElementById('raceOppSpeed');

  const RACE_TARGET = 1000;
  const RACE_IMPULSE = 16;
  const RACE_MAX_SPEED = 62;
  const RACE_FRICTION = 0.965;

  let raceMyProgress = 0, raceMyVelocity = 0;
  let raceOppProgress = 0, raceOppVelocity = 0, raceOppTarget = 0;
  let raceFinished = null;
  let raceRafId = null;
  let raceLastTs = 0;
  let raceRoadOffset = 0;
  let raceLastSync = 0;

  function raceSizeCanvas(){
    const rect = raceCanvas.getBoundingClientRect();
    raceCanvas.width = rect.width * (window.devicePixelRatio||1);
    raceCanvas.height = rect.height * (window.devicePixelRatio||1);
    raceCtx.setTransform(window.devicePixelRatio||1, 0, 0, window.devicePixelRatio||1, 0, 0);
  }

  function openRace(){
    raceEl.classList.add('show');
    raceSizeCanvas();
    raceMyProgress = 0; raceMyVelocity = 0;
    raceOppProgress = 0; raceOppVelocity = 0; raceOppTarget = 0;
    raceFinished = null;
    raceLastTs = 0;
    const ref = db.ref('games/race');
    raceListenerRef = ref;
    ref.once('value').then(function(snap){
      const state = snap.val();
      if(!state || state.finished === undefined){
        ref.set({ progress: { Sahil: 0, Ananya: 0 }, finished: null });
      }
    });
    ref.on('value', function(snap){
      const state = snap.val();
      if(!state) return;
      const opp = otherPersonName();
      raceOppTarget = (state.progress && state.progress[opp]) || 0;
      if(state.finished && !raceFinished){
        raceFinished = state.finished;
      }
      if(!state.finished){ raceFinished = null; }
    });
    if(raceRafId) cancelAnimationFrame(raceRafId);
    raceRafId = requestAnimationFrame(raceLoop);
  }

  function raceLoop(ts){
    if(!raceLastTs) raceLastTs = ts;
    const dt = Math.min((ts - raceLastTs) / 1000, 0.05);
    raceLastTs = ts;

    raceMyVelocity *= RACE_FRICTION;
    raceMyProgress = Math.min(raceMyProgress + raceMyVelocity * dt * 40, RACE_TARGET);

    raceOppVelocity += (raceOppTarget - raceOppProgress) * 0.12;
    raceOppVelocity *= 0.9;
    raceOppProgress = Math.min(raceOppProgress + raceOppVelocity * dt * 40, RACE_TARGET);

    raceRoadOffset = (raceRoadOffset + raceMyVelocity * dt * 40) % 40;

    if(!raceFinished && raceMyProgress >= RACE_TARGET){
      raceFinished = myName;
      db.ref('games/race/finished').transaction(function(cur){ return cur ? cur : myName; });
    }

    if(ts - raceLastSync > 120){
      raceLastSync = ts;
      db.ref('games/race/progress/' + myName).set(Math.round(raceMyProgress));
    }

    raceDraw();
    raceMySpeedEl.textContent = Math.round(Math.abs(raceMyVelocity));
    raceOppSpeedEl.textContent = Math.round(Math.abs(raceOppVelocity));

    if(raceFinished){
      raceStatusEl.textContent = (raceFinished === myName) ? 'You won the race! 🏁' : (raceFinished + ' won the race!');
    } else {
      raceStatusEl.textContent = 'Tap GO! rapidly to accelerate';
    }

    raceRafId = requestAnimationFrame(raceLoop);
  }

  function raceDraw(){
    const w = raceCanvas.clientWidth, h = raceCanvas.clientHeight;
    raceCtx.clearRect(0,0,w,h);
    // sky/bg
    const grad = raceCtx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#141b38'); grad.addColorStop(1,'#1a2340');
    raceCtx.fillStyle = grad; raceCtx.fillRect(0,0,w,h);

    const laneH = h/2;
    [0,1].forEach(function(lane){
      const y0 = lane*laneH;
      raceCtx.fillStyle = 'rgba(20,27,56,0.6)';
      raceCtx.fillRect(0, y0+10, w, laneH-20);
      // dashed center line, scrolling
      raceCtx.strokeStyle = 'rgba(217,179,120,0.35)';
      raceCtx.lineWidth = 2;
      raceCtx.setLineDash([16,14]);
      raceCtx.lineDashOffset = -raceRoadOffset;
      raceCtx.beginPath();
      raceCtx.moveTo(0, y0+laneH/2);
      raceCtx.lineTo(w, y0+laneH/2);
      raceCtx.stroke();
      raceCtx.setLineDash([]);
    });

    // finish line
    const finishX = w - 34;
    raceCtx.fillStyle = 'rgba(217,179,120,0.5)';
    raceCtx.fillRect(finishX, 4, 4, h-8);
    raceCtx.font = '18px sans-serif';
    raceCtx.fillText('🏁', finishX-6, 20);
    raceCtx.fillText('🏁', finishX-6, h-6);

    const trackW = finishX - 24;
    const myX = 12 + Math.min(raceMyProgress/RACE_TARGET, 1) * trackW;
    const oppX = 12 + Math.min(raceOppProgress/RACE_TARGET, 1) * trackW;

    raceCtx.font = '26px sans-serif';
    raceCtx.save();
    raceCtx.translate(myX, laneH*0.5+8);
    if(raceMyVelocity > 2) raceCtx.rotate(Math.sin(raceLastTs/40)*0.02);
    raceCtx.fillText('🏎️', -13, 8);
    raceCtx.restore();

    raceCtx.save();
    raceCtx.translate(oppX, laneH*1.5+8);
    raceCtx.fillText('🏎️', -13, 8);
    raceCtx.restore();

    raceCtx.font = '11px Jost, sans-serif';
    raceCtx.fillStyle = '#e8c896';
    raceCtx.fillText(myName, 10, laneH*0.5-16);
    raceCtx.fillText(otherPersonName(), 10, laneH*1.5-16);
  }

  document.getElementById('raceTapBtn').addEventListener('click', function(){
    if(raceFinished) return;
    raceMyVelocity = Math.min(raceMyVelocity + RACE_IMPULSE, RACE_MAX_SPEED);
  });
  document.getElementById('raceResetBtn').addEventListener('click', function(){
    raceMyProgress = 0; raceMyVelocity = 0; raceOppProgress = 0; raceOppVelocity = 0; raceFinished = null;
    db.ref('games/race').set({ progress: { Sahil: 0, Ananya: 0 }, finished: null });
  });
  window.addEventListener('resize', function(){ if(raceEl.classList.contains('show')) raceSizeCanvas(); });

  const _origCloseAllGameScreensRace = closeAllGameScreens;
  closeAllGameScreens = function(){
    _origCloseAllGameScreensRace();
    if(raceRafId){ cancelAnimationFrame(raceRafId); raceRafId = null; }
  };


  /* ---- Flamingo (couple questions) ---- */
  document.getElementById('flamCloseBtn').addEventListener('click', closeAllGameScreens);
  const flamCounterEl = document.getElementById('flamCounter');
  const flamQEl = document.getElementById('flamQ');

  const FLAMINGO_QUESTIONS = [
    "What's a small thing I do that makes you feel loved?",
    "What was your first impression of me?",
    "What's your favorite memory of us so far?",
    "If we could teleport anywhere right now, where would you take me?",
    "What's something you've always wanted to tell me but haven't?",
    "What song reminds you of us?",
    "What's one thing you'd love for us to try together?",
    "What's your favorite thing about the way I laugh, talk, or move?",
    "What's a dream you have that I don't fully know about?",
    "What made you realize you had feelings for me?",
    "What's your idea of a perfect lazy Sunday with me?",
    "What's something I do that instantly makes your day better?",
    "If we wrote a book about us, what would the title be?",
    "What's a habit of mine you secretly find adorable?",
    "What do you think our life will look like in 5 years?",
    "What's the silliest thing we've ever argued about?",
    "What's one place you'd love to travel to together?",
    "What's your favorite thing about how we communicate?",
    "What's something you learned about love from us?",
    "What's a food you'd want us to try cooking together?",
    "What's the most romantic thing I've ever done for you?",
    "What's a fear you have that you've only shared with me?",
    "What's your favorite nickname for me and why?",
    "What's something about me that surprised you the most?",
    "If we had a pet together, what would we name it?",
    "What's a tradition you'd like us to start?",
    "What's the best gift I've given you?",
    "What's a quality of mine you admire the most?",
    "What's your favorite way to spend time together when we're both busy?",
    "What's one thing you're grateful for about our relationship today?",
    "What's a movie or show we should watch together next?",
    "What's something small I said once that you never forgot?",
    "What's your love language, and do you feel like I speak it?",
    "What's a goal you want us to achieve together this year?",
    "What's the funniest memory you have of us?",
    "What's something you'd want to relive from our story?",
    "What's a compliment you wish I gave you more often?",
    "What's your favorite way for us to say 'I love you' without words?",
    "What's something you want to apologize for, even if it's small?",
    "What's a moment you felt truly proud of me?",
    "If we could freeze one day of our life forever, which would it be?",
    "What's something new you'd like to learn about me?",
    "What's your favorite thing to do when we're apart and missing each other?",
    "What's a promise you want to make to me right now?",
    "What's one thing about our future you're most excited for?",
    "What's a song you'd want played at our wedding, hypothetically?",
    "What's something I do during a fight that helps you calm down?",
    "What's your happiest memory from our relationship this year?",
    "What's a way I can support you better right now?",
    "What's something you find beautiful about how I see the world?",
    "If today was our anniversary, how would you want to spend it?",
    "What's your favorite thing about growing older with me?",
    "What's a childhood memory you'd love to share with me in person?",
    "What's something you never get tired of hearing me say?",
    "What's the most 'us' thing about us?",
    "What's a dream date you'd love to plan for me?",
    "What's one word that describes how I make you feel?",
    "What's something you're proud we've overcome together?",
    "What's a way you'd like to be comforted after a hard day?",
    "What's your favorite thing to daydream about, involving me?"
  ];

  function openFlamingo(){
    flamEl.classList.add('show');
    const ref = db.ref('games/flamingo');
    flamListenerRef = ref;
    ref.once('value').then(function(snap){
      if(!snap.exists()){
        pickFlamingoQuestion([]);
      }
    });
    ref.on('value', function(snap){
      const state = snap.val();
      if(!state) return;
      renderFlamingo(state);
    });
  }

  function pickFlamingoQuestion(used){
    let pool = FLAMINGO_QUESTIONS.map(function(_,i){ return i; }).filter(function(i){ return used.indexOf(i) === -1; });
    if(pool.length === 0){ pool = FLAMINGO_QUESTIONS.map(function(_,i){ return i; }); used = []; }
    const next = pool[Math.floor(Math.random()*pool.length)];
    const newUsed = used.concat([next]);
    db.ref('games/flamingo').set({ currentIndex: next, used: newUsed });
  }

  function renderFlamingo(state){
    const q = FLAMINGO_QUESTIONS[state.currentIndex] || '...';
    flamQEl.textContent = q;
    const usedCount = (state.used || []).length;
    flamCounterEl.textContent = usedCount + ' / ' + FLAMINGO_QUESTIONS.length + ' questions explored';
  }

  document.getElementById('flamNextBtn').addEventListener('click', function(){
    db.ref('games/flamingo').once('value').then(function(snap){
      const state = snap.val() || { used: [] };
      pickFlamingoQuestion(state.used || []);
    });
  });

  /* ---------------- WATCH PARTY ---------------- */
  document.getElementById('wpCloseBtn').addEventListener('click', closeAllGameScreens);

  /* ---- Watch Party mini chat (mirrors main chat) ---- */
  const wpMiniChatEl = document.getElementById('wpMiniChat');
  const wpMiniMsgsEl = document.getElementById('wpMiniMsgs');
  const wpMiniInput = document.getElementById('wpMiniInput');
  let wpMiniChatRef = null;

  document.getElementById('wpChatToggle').addEventListener('click', function(){
    wpMiniChatEl.classList.toggle('show');
    if(wpMiniChatEl.classList.contains('show') && !wpMiniChatRef){
      wpMiniChatRef = db.ref('messages').limitToLast(30);
      wpMiniChatRef.on('value', function(snap){
        const val = snap.val();
        wpMiniMsgsEl.innerHTML = '';
        if(!val) return;
        Object.keys(val).forEach(function(k){
          const m = val[k];
          const row = document.createElement('div');
          row.className = 'wpMiniRow';
          row.innerHTML = '<b>' + m.sender + ':</b> ' + (m.text || (m.fileName ? '📎 ' + m.fileName : ''));
          wpMiniMsgsEl.appendChild(row);
        });
        wpMiniMsgsEl.scrollTop = wpMiniMsgsEl.scrollHeight;
      });
    }
  });

  function wpMiniSend(){
    const text = wpMiniInput.value.trim();
    if(!text) return;
    db.ref('messages').push({ sender: myName, text: text, ts: Date.now() });
    logActivityToday();
    sendPush(otherPersonName(), myName, text);
    wpMiniInput.value = '';
  }
  document.getElementById('wpMiniSendBtn').addEventListener('click', wpMiniSend);
  wpMiniInput.addEventListener('keydown', function(e){ if(e.key==='Enter') wpMiniSend(); });

  /* ---- Watch Together: quick call button ---- */
  document.getElementById('wpCallBtn').addEventListener('click', function(){
    startOutgoingCall('audio');
  });

  /* ---- Watch Together: live emoji reactions ---- */
  const wpReactionLayerEl = document.getElementById('wpReactionLayer');
  let wpReactionsRef = null;
  let wpQueueRef = null;
  let wpLastReactionTs = 0;

  function wpSpawnEmoji(emoji){
    const el = document.createElement('div');
    el.className = 'wpFloatEmoji';
    el.textContent = emoji;
    el.style.left = (10 + Math.random()*70) + '%';
    el.style.bottom = '80px';
    wpReactionLayerEl.appendChild(el);
    setTimeout(function(){ el.remove(); }, 2500);
  }

  document.querySelectorAll('.wpReactBtn').forEach(function(btn){
    btn.addEventListener('click', function(){
      const emoji = btn.getAttribute('data-emoji');
      wpSpawnEmoji(emoji);
      db.ref('watchParty/reaction').set({ emoji: emoji, by: myName, ts: firebase.database.ServerValue.TIMESTAMP });
    });
  });

  const wpPanes = { youtube: document.getElementById('wpYoutube'), video: document.getElementById('wpVideo'), countdown: document.getElementById('wpCountdown') };
  let wpCurrentMode = 'youtube';
  document.querySelectorAll('.wpTab').forEach(function(tab){
    tab.addEventListener('click', function(){
      document.querySelectorAll('.wpTab').forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      wpCurrentMode = tab.getAttribute('data-mode');
      Object.keys(wpPanes).forEach(function(k){ wpPanes[k].style.display = (k===wpCurrentMode) ? 'flex' : 'none'; });
    });
  });

  let wpPresenceRef = null;
  function openWatchParty(){
    wpEl.classList.add('show');
    const ref = db.ref('watchParty');
    wpListenerRef = ref;
    ref.on('value', function(snap){
      const state = snap.val();
      if(!state) return;
      handleWpState(state);
    });
    wpReactionsRef = db.ref('watchParty/reaction');
    wpReactionsRef.on('value', function(snap){
      const r = snap.val();
      if(!r || !r.ts) return;
      if(r.ts === wpLastReactionTs) return;
      wpLastReactionTs = r.ts;
      if(r.by !== myName) wpSpawnEmoji(r.emoji);
    });

    db.ref('watchParty/presence/' + myName).set(true);
    db.ref('watchParty/presence/' + myName).onDisconnect().set(false);
    wpPresenceRef = db.ref('watchParty/presence/' + otherPersonName());
    let wpPresenceKnown = null;
    wpPresenceRef.on('value', function(snap){
      const dot = document.getElementById('wpPresenceDot');
      const txt = document.getElementById('wpPresenceText');
      const isOnline = !!snap.val();
      if(isOnline){
        dot.classList.add('online');
        txt.textContent = otherPersonName() + ' is watching too';
      } else {
        dot.classList.remove('online');
        txt.textContent = 'waiting for ' + otherPersonName() + '\u2026';
      }
      if(wpPresenceKnown !== null && wpPresenceKnown !== isOnline){
        showToast(otherPersonName() + (isOnline ? ' joined the party 🎬' : ' left the party'));
      }
      wpPresenceKnown = isOnline;
    });

    wpQueueRef = db.ref('watchParty/queue');
    wpQueueRef.on('value', function(snap){ renderWpQueue(snap.val()); });
  }

  let wpLastWriteTs = 0;
  function wpIsOwnRecentWrite(state){
    return state.updatedBy === myName && (Date.now() - (state.updatedAt || 0)) < 1200;
  }

  /* ---- YouTube sync ---- */
  let wpYtPlayer = null;
  let wpYtReady = false;
  let wpYtApiLoading = false;
  let wpPendingYtId = null;

  function wpEnsureYtApi(cb){
    if(window.YT && window.YT.Player){ cb(); return; }
    if(!wpYtApiLoading){
      wpYtApiLoading = true;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
    const prevCb = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function(){ if(prevCb) prevCb(); cb(); };
  }

  function wpParseYoutubeId(url){
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  /* ---- Watch Together: Up Next queue ---- */
  document.getElementById('wpQueueToggle').addEventListener('click', function(){
    document.getElementById('wpQueuePanel').classList.add('show');
  });
  document.getElementById('wpQueueCloseBtn').addEventListener('click', function(){
    document.getElementById('wpQueuePanel').classList.remove('show');
  });
  document.getElementById('wpQueueAddBtn').addEventListener('click', function(){
    const input = document.getElementById('wpQueueInput');
    const vid = wpParseYoutubeId(input.value.trim());
    if(!vid){ showToast("That doesn't look like a YouTube link.", 'error'); return; }
    db.ref('watchParty/queue').push({ youtubeId: vid, addedBy: myName, ts: firebase.database.ServerValue.TIMESTAMP });
    input.value = '';
    showToast('Added to queue');
  });

  function renderWpQueue(val){
    const listEl = document.getElementById('wpQueueList');
    listEl.innerHTML = '';
    if(!val){ listEl.innerHTML = '<div id="vnEmpty">Queue is empty — add a video below</div>'; return; }
    const entries = Object.keys(val).map(function(k){ return Object.assign({id:k}, val[k]); });
    entries.sort(function(a,b){ return (a.ts||0)-(b.ts||0); });
    entries.forEach(function(item){
      const row = document.createElement('div');
      row.className = 'wpQueueItem';
      const thumb = document.createElement('img');
      thumb.className = 'wpQueueThumb';
      thumb.src = 'https://img.youtube.com/vi/' + item.youtubeId + '/default.jpg';
      const title = document.createElement('div');
      title.className = 'wpQueueTitle';
      title.textContent = 'Added by ' + item.addedBy;
      const playBtn = document.createElement('button');
      playBtn.className = 'wpQueuePlayBtn';
      playBtn.textContent = 'Play';
      playBtn.addEventListener('click', function(){
        db.ref('watchParty').update({ mode:'youtube', youtubeId: item.youtubeId, playing:false, position:0, updatedBy:myName, updatedAt:firebase.database.ServerValue.TIMESTAMP });
        db.ref('watchParty/queue/' + item.id).remove();
        document.getElementById('wpQueuePanel').classList.remove('show');
      });
      const delBtn = document.createElement('button');
      delBtn.className = 'wpQueueDelBtn';
      delBtn.textContent = '🗑';
      delBtn.addEventListener('click', function(){ db.ref('watchParty/queue/' + item.id).remove(); });
      row.appendChild(thumb); row.appendChild(title); row.appendChild(playBtn); row.appendChild(delBtn);
      listEl.appendChild(row);
    });
  }

  function wpSetupMediaSession(title){
    if(!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || 'Watching together',
      artist: 'Saan — Watch Together',
      artwork: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }]
    });
    try{
      navigator.mediaSession.setActionHandler('play', function(){ if(wpYtPlayer) wpYtPlayer.playVideo(); });
      navigator.mediaSession.setActionHandler('pause', function(){ if(wpYtPlayer) wpYtPlayer.pauseVideo(); });
    }catch(e){ /* some browsers reject unsupported handlers */ }
  }

  function wpCreateYtPlayer(videoId){
    document.getElementById('wpYtErr').style.display = 'none';
    const loadTimeout = setTimeout(function(){
      if(!wpYtReady){
        document.getElementById('wpYtErr').textContent = "Video is taking too long to load. Try: close this app, clear your browser cache/site data for this app, and reopen — you may be on an old cached version.";
        document.getElementById('wpYtErr').style.display = 'block';
      }
    }, 8000);
    wpEnsureYtApi(function(){
      if(wpYtPlayer){
        wpYtPlayer.loadVideoById(videoId);
        clearTimeout(loadTimeout);
        return;
      }
      wpYtPlayer = new YT.Player('wpYtPlayer', {
        width: '100%', height: '100%',
        videoId: videoId,
        playerVars: { playsinline: 1, rel: 0 },
        events: {
          onReady: function(){
            wpYtReady = true; clearTimeout(loadTimeout); document.getElementById('wpYtErr').style.display = 'none';
            wpSetupMediaSession();
          },
          onError: function(e){
            clearTimeout(loadTimeout);
            document.getElementById('wpYtErr').textContent = 'Could not load this video (it may not allow embedding). Try a different link.';
            document.getElementById('wpYtErr').style.display = 'block';
          },
          onStateChange: function(e){
            if(e.data === YT.PlayerState.PLAYING){
              wpWriteState({ playing: true, position: wpYtPlayer.getCurrentTime() });
              if('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
              const data = wpYtPlayer.getVideoData ? wpYtPlayer.getVideoData() : null;
              if(data && data.title) wpSetupMediaSession(data.title);
            }
            else if(e.data === YT.PlayerState.PAUSED){
              wpWriteState({ playing: false, position: wpYtPlayer.getCurrentTime() });
              if('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
            }
            else if(e.data === YT.PlayerState.ENDED){
              db.ref('watchParty/queue').once('value').then(function(snap){
                const val = snap.val();
                if(!val) return;
                const entries = Object.keys(val).map(function(k){ return Object.assign({id:k}, val[k]); });
                entries.sort(function(a,b){ return (a.ts||0)-(b.ts||0); });
                if(entries.length === 0) return;
                const next = entries[0];
                db.ref('watchParty').update({ mode:'youtube', youtubeId: next.youtubeId, playing:true, position:0, updatedBy:myName, updatedAt:firebase.database.ServerValue.TIMESTAMP });
                db.ref('watchParty/queue/' + next.id).remove();
              });
            }
          }
        }
      });
    });
  }

  document.getElementById('wpYtAddBtn').addEventListener('click', function(){
    const url = document.getElementById('wpYtInput').value.trim();
    const vid = wpParseYoutubeId(url);
    document.getElementById('wpYtErr').style.display = 'none';
    if(!vid){ document.getElementById('wpYtErr').textContent = "That doesn't look like a YouTube link."; document.getElementById('wpYtErr').style.display = 'block'; return; }
    db.ref('watchParty').set({ mode: 'youtube', youtubeId: vid, playing: false, position: 0, updatedBy: myName, updatedAt: firebase.database.ServerValue.TIMESTAMP });
  });

  /* ---- Direct video sync ---- */
  const wpVideoEl = document.getElementById('wpVideoEl');
  let wpVideoSuppress = false;
  wpVideoEl.addEventListener('play', function(){ if(!wpVideoSuppress) wpWriteState({ playing: true, position: wpVideoEl.currentTime }); });
  wpVideoEl.addEventListener('pause', function(){ if(!wpVideoSuppress) wpWriteState({ playing: false, position: wpVideoEl.currentTime }); });
  wpVideoEl.addEventListener('seeked', function(){ if(!wpVideoSuppress) wpWriteState({ playing: !wpVideoEl.paused, position: wpVideoEl.currentTime }); });

  document.getElementById('wpVideoAddBtn').addEventListener('click', function(){
    const url = document.getElementById('wpVideoInput').value.trim();
    if(!url) return;
    db.ref('watchParty').set({ mode: 'video', videoUrl: url, playing: false, position: 0, updatedBy: myName, updatedAt: firebase.database.ServerValue.TIMESTAMP });
  });

  function wpWriteState(partial){
    const updates = Object.assign({ updatedBy: myName, updatedAt: firebase.database.ServerValue.TIMESTAMP }, partial);
    db.ref('watchParty').update(updates);
  }

  function handleWpState(state){
    if(state.mode === 'youtube' && state.youtubeId){
      if(wpPendingYtId !== state.youtubeId){
        wpPendingYtId = state.youtubeId;
        wpCreateYtPlayer(state.youtubeId);
      }
      if(wpIsOwnRecentWrite(state)) return;
      if(wpYtReady && wpYtPlayer && wpYtPlayer.getCurrentTime){
        const drift = Math.abs(wpYtPlayer.getCurrentTime() - state.position);
        if(drift > 1.5) wpYtPlayer.seekTo(state.position, true);
        if(state.playing && wpYtPlayer.getPlayerState() !== 1) wpYtPlayer.playVideo();
        if(!state.playing && wpYtPlayer.getPlayerState() === 1) wpYtPlayer.pauseVideo();
      }
    } else if(state.mode === 'video' && state.videoUrl){
      if(wpVideoEl.getAttribute('data-src') !== state.videoUrl){
        wpVideoEl.setAttribute('data-src', state.videoUrl);
        wpVideoEl.src = state.videoUrl;
      }
      if(wpIsOwnRecentWrite(state)) return;
      wpVideoSuppress = true;
      const drift = Math.abs(wpVideoEl.currentTime - state.position);
      if(drift > 1.5) wpVideoEl.currentTime = state.position;
      if(state.playing) wpVideoEl.play().catch(function(){});
      else wpVideoEl.pause();
      setTimeout(function(){ wpVideoSuppress = false; }, 300);
    } else if(state.mode === 'countdown'){
      wpHandleCountdown(state);
    }
  }

  /* ---- OTT sync countdown ---- */
  const wpCdDisplayEl = document.getElementById('wpCdDisplay');
  let wpCdInterval = null;

  document.getElementById('wpCdStartBtn').addEventListener('click', function(){
    db.ref('.info/serverTimeOffset').once('value').then(function(snap){
      const offset = snap.val() || 0;
      const serverNow = Date.now() + offset;
      const startAt = serverNow + 5000;
      db.ref('watchParty').set({ mode: 'countdown', startAt: startAt, updatedBy: myName, updatedAt: firebase.database.ServerValue.TIMESTAMP });
    });
  });

  function wpHandleCountdown(state){
    if(!state.startAt) return;
    if(wpCdInterval) clearInterval(wpCdInterval);
    db.ref('.info/serverTimeOffset').once('value').then(function(snap){
      const offset = snap.val() || 0;
      wpCdInterval = setInterval(function(){
        const now = Date.now() + offset;
        const remain = Math.ceil((state.startAt - now) / 1000);
        if(remain > 0){
          wpCdDisplayEl.textContent = remain;
        } else {
          wpCdDisplayEl.textContent = 'PLAY NOW! 🎬';
          clearInterval(wpCdInterval); wpCdInterval = null;
        }
      }, 200);
    });
  }

  /* ---------------- SNAKE & LADDER ---------------- */
  document.getElementById('slCloseBtn').addEventListener('click', closeAllGameScreens);
  const slBoardEl = document.getElementById('slBoard');
  const slStatusEl = document.getElementById('slStatus');
  const slDiceEl = document.getElementById('slDice');
  const slRollBtn = document.getElementById('slRollBtn');

  const SL_SNAKES = { 16:6, 47:26, 49:11, 56:53, 62:19, 64:60, 87:24, 93:73, 95:75, 98:78 };
  const SL_LADDERS = { 1:38, 4:14, 9:31, 21:42, 28:84, 36:44, 51:67, 71:91, 80:100 };
  const DICE_FACES = ['','⚀','⚁','⚂','⚃','⚄','⚅'];

  function slCellNumber(rowFromTop, col){
    const rowFromBottom = 9 - rowFromTop;
    return (rowFromBottom % 2 === 0) ? (rowFromBottom*10 + col + 1) : (rowFromBottom*10 + (10 - col));
  }

  const slCellPos = {};
  function slBuildBoard(){
    slBoardEl.innerHTML = '';
    for(let r=0;r<10;r++){
      for(let c=0;c<10;c++){
        const num = slCellNumber(r,c);
        slCellPos[num] = { row:r, col:c };
        const cell = document.createElement('div');
        cell.className = 'slCell';
        cell.id = 'slc-' + num;
        if(SL_SNAKES[num]) cell.classList.add('snakeHead');
        if(SL_LADDERS[num]) cell.classList.add('ladderBot');
        cell.textContent = num;
        slBoardEl.appendChild(cell);
      }
    }
  }

  function slDrawOverlay(){
    const svg = document.getElementById('slOverlay');
    const boardRect = slBoardEl.getBoundingClientRect();
    const wrapRect = document.getElementById('slBoardWrap').getBoundingClientRect();
    if(boardRect.width === 0) return;
    svg.style.left = (boardRect.left - wrapRect.left) + 'px';
    svg.style.top = (boardRect.top - wrapRect.top) + 'px';
    svg.style.width = boardRect.width + 'px';
    svg.style.height = boardRect.height + 'px';
    svg.setAttribute('viewBox', '0 0 ' + boardRect.width + ' ' + boardRect.height);
    svg.innerHTML = '';
    const cellW = boardRect.width/10, cellH = boardRect.height/10;
    const NS = 'http://www.w3.org/2000/svg';

    function centerOf(num){
      const pos = slCellPos[num];
      return { x: pos.col*cellW + cellW/2, y: pos.row*cellH + cellH/2 };
    }

    Object.keys(SL_LADDERS).forEach(function(bottomStr){
      const bottom = parseInt(bottomStr), top = SL_LADDERS[bottomStr];
      const p1 = centerOf(bottom), p2 = centerOf(top);
      const dx = p2.x-p1.x, dy = p2.y-p1.y;
      const len = Math.hypot(dx,dy) || 1;
      const ux = dx/len, uy = dy/len;
      const px = -uy, py = ux;
      const railOffset = cellW*0.14;
      const rail1a = {x:p1.x+px*railOffset, y:p1.y+py*railOffset};
      const rail1b = {x:p2.x+px*railOffset, y:p2.y+py*railOffset};
      const rail2a = {x:p1.x-px*railOffset, y:p1.y-py*railOffset};
      const rail2b = {x:p2.x-px*railOffset, y:p2.y-py*railOffset};
      [[rail1a,rail1b],[rail2a,rail2b]].forEach(function(pair){
        const line = document.createElementNS(NS,'line');
        line.setAttribute('x1',pair[0].x); line.setAttribute('y1',pair[0].y);
        line.setAttribute('x2',pair[1].x); line.setAttribute('y2',pair[1].y);
        line.setAttribute('stroke','#d9b378'); line.setAttribute('stroke-width', Math.max(2,cellW*0.06));
        line.setAttribute('stroke-linecap','round');
        svg.appendChild(line);
      });
      const rungCount = Math.max(3, Math.round(len/(cellH*0.6)));
      for(let i=1;i<rungCount;i++){
        const t = i/rungCount;
        const cx1 = rail1a.x + (rail1b.x-rail1a.x)*t, cy1 = rail1a.y + (rail1b.y-rail1a.y)*t;
        const cx2 = rail2a.x + (rail2b.x-rail2a.x)*t, cy2 = rail2a.y + (rail2b.y-rail2a.y)*t;
        const rung = document.createElementNS(NS,'line');
        rung.setAttribute('x1',cx1); rung.setAttribute('y1',cy1);
        rung.setAttribute('x2',cx2); rung.setAttribute('y2',cy2);
        rung.setAttribute('stroke','#a87f45'); rung.setAttribute('stroke-width', Math.max(1.5,cellW*0.035));
        svg.appendChild(rung);
      }
    });

    Object.keys(SL_SNAKES).forEach(function(headStr){
      const head = parseInt(headStr), tail = SL_SNAKES[headStr];
      const p1 = centerOf(head), p2 = centerOf(tail);
      const dx = p2.x-p1.x, dy = p2.y-p1.y;
      const len = Math.hypot(dx,dy) || 1;
      const ux = dx/len, uy = dy/len;
      const px = -uy, py = ux;
      const segments = 6;
      const pts = [p1];
      for(let i=1;i<segments;i++){
        const t = i/segments;
        const baseX = p1.x + dx*t, baseY = p1.y + dy*t;
        const wobble = Math.sin(t*Math.PI*2.4) * cellW*0.5;
        pts.push({ x: baseX + px*wobble, y: baseY + py*wobble });
      }
      pts.push(p2);
      let d = 'M '+pts[0].x+' '+pts[0].y+' ';
      for(let i=1;i<pts.length;i++){ d += 'L '+pts[i].x+' '+pts[i].y+' '; }
      const path = document.createElementNS(NS,'path');
      path.setAttribute('d', d);
      path.setAttribute('fill','none');
      path.setAttribute('stroke','#7a1f33');
      path.setAttribute('stroke-width', Math.max(4, cellW*0.22));
      path.setAttribute('stroke-linecap','round');
      path.setAttribute('stroke-linejoin','round');
      path.setAttribute('opacity','0.9');
      svg.appendChild(path);

      const headCircle = document.createElementNS(NS,'circle');
      headCircle.setAttribute('cx',p1.x); headCircle.setAttribute('cy',p1.y);
      headCircle.setAttribute('r', cellW*0.18);
      headCircle.setAttribute('fill','#a02832');
      svg.appendChild(headCircle);
      const eyeText = document.createElementNS(NS,'text');
      eyeText.setAttribute('x', p1.x); eyeText.setAttribute('y', p1.y + cellH*0.06);
      eyeText.setAttribute('text-anchor','middle');
      eyeText.setAttribute('font-size', cellW*0.24);
      eyeText.textContent = '\u{1F440}';
      svg.appendChild(eyeText);
    });
  }
  window.addEventListener('resize', function(){ if(slEl.classList.contains('show')) slDrawOverlay(); });

  function openSnakeLadder(){
    slEl.classList.add('show');
    slBuildBoard();
    setTimeout(slDrawOverlay, 30);
    const ref = db.ref('games/snakeladder');
    slListenerRef = ref;
    ref.once('value').then(function(snap){
      if(!snap.exists()){ ref.set({ positions: { Sahil: 0, Ananya: 0 }, turn: 'Sahil', winner: null, lastRoll: null }); }
    });
    ref.on('value', function(snap){
      const state = snap.val();
      if(!state) return;
      renderSnakeLadder(state);
    });
  }

  function slPlaceToken(cls, num){
    document.querySelectorAll('.' + cls).forEach(function(t){ t.remove(); });
    const cellId = num > 0 ? 'slc-' + num : 'slc-1';
    const cell = document.getElementById(cellId);
    if(!cell) return;
    const token = document.createElement('div');
    token.className = 'slToken ' + cls;
    if(num === 0) token.style.opacity = '0.4';
    token.textContent = cls === 'p1' ? 'S' : 'A';
    cell.appendChild(token);
  }

  function renderSnakeLadder(state){
    slPlaceToken('p1', state.positions.Sahil);
    slPlaceToken('p2', state.positions.Ananya);
    slDiceEl.textContent = state.lastRoll ? DICE_FACES[state.lastRoll] : '?';
    if(state.winner){
      slStatusEl.textContent = (state.winner === myName) ? 'You won! 🎉' : (state.winner + ' won!');
      slRollBtn.disabled = true;
    } else {
      slStatusEl.textContent = (state.turn === myName) ? 'Your turn — roll the dice' : (otherPersonName() + "'s turn");
      slRollBtn.disabled = (state.turn !== myName);
    }
  }

  slRollBtn.addEventListener('click', function(){
    if(slRollBtn.disabled) return;
    slRollBtn.disabled = true;
    db.ref('games/snakeladder').once('value').then(function(snap){
      const state = snap.val();
      if(!state || state.winner || state.turn !== myName) return;
      const roll = 1 + Math.floor(Math.random()*6);
      let pos = state.positions[myName] || 0;
      let newPos = pos + roll;
      if(newPos > 100){ newPos = pos; }
      else {
        if(SL_SNAKES[newPos]) newPos = SL_SNAKES[newPos];
        else if(SL_LADDERS[newPos]) newPos = SL_LADDERS[newPos];
      }
      const updates = {};
      updates['positions/' + myName] = newPos;
      updates['lastRoll'] = roll;
      updates['turn'] = otherPersonName();
      if(newPos === 100) updates['winner'] = myName;
      db.ref('games/snakeladder').update(updates);
    }).catch(function(){ slRollBtn.disabled = false; });
  });
  document.getElementById('slResetBtn').addEventListener('click', function(){
    db.ref('games/snakeladder').set({ positions: { Sahil: 0, Ananya: 0 }, turn: 'Sahil', winner: null, lastRoll: null });
  });

  /* ---------------- LUDO (simplified: shared 52-ring track + home stretch) ---------------- */
  document.getElementById('ludoCloseBtn').addEventListener('click', closeAllGameScreens);
  const ludoCanvas = document.getElementById('ludoCanvas');
  const ludoCtx = ludoCanvas.getContext('2d');
  const ludoStatusEl = document.getElementById('ludoStatus');
  const ludoDiceEl = document.getElementById('ludoDice');
  const ludoRollBtn = document.getElementById('ludoRollBtn');

  const LUDO_TRACK_LEN = 52;
  const LUDO_HOME_STRETCH = 6;
  const LUDO_START = { Sahil: 0, Ananya: 26 };
  const LUDO_SAFE = [0,8,13,21,26,34,39,47];
  let ludoSelectedState = null;

  function ludoInitTokens(){
    return [
      { pos: -1, homeSteps: 0 }, { pos: -1, homeSteps: 0 }
    ];
  }

  function openLudo(){
    ludoEl.classList.add('show');
    ludoSizeCanvas();
    const ref = db.ref('games/ludo');
    ludoListenerRef = ref;
    ref.once('value').then(function(snap){
      if(!snap.exists()){
        ref.set({ tokens: { Sahil: ludoInitTokens(), Ananya: ludoInitTokens() }, turn: 'Sahil', lastRoll: null, winner: null });
      }
    });
    ref.on('value', function(snap){
      const state = snap.val();
      if(!state) return;
      renderLudo(state);
    });
  }
  function ludoSizeCanvas(){
    const rect = ludoCanvas.getBoundingClientRect();
    ludoCanvas.width = rect.width; ludoCanvas.height = rect.height;
  }
  window.addEventListener('resize', function(){ if(ludoEl.classList.contains('show')) ludoSizeCanvas(); });

  /* 15x15 classic Ludo grid. Path is the 52-cell ring; home columns lead into the center. */
  const LUDO_PATH_RC = [
    [6,1],[6,2],[6,3],[6,4],[6,5],
    [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
    [0,7],
    [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],
    [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
    [7,14],
    [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],
    [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
    [14,7],
    [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],
    [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
    [7,0],
    [6,0]
  ];
  const LUDO_HOME_COL_RC = {
    Sahil:  [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
    Ananya: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]]
  };
  const LUDO_HOME_BASE_RC = { Sahil: [1.5,1.5], Ananya: [11.5,11.5] };
  const LUDO_COLOR = { Sahil: '#c23a54', Ananya: '#5f7a9e' };

  function ludoCellBox(){
    return Math.min(ludoCanvas.width, ludoCanvas.height) / 15;
  }
  function ludoRcToXY(r, c){
    const cell = ludoCellBox();
    return { x: c*cell + cell/2, y: r*cell + cell/2, cell: cell };
  }

  function renderLudo(state){
    const w = ludoCanvas.width, h = ludoCanvas.height;
    ludoCtx.clearRect(0,0,w,h);
    const cell = ludoCellBox();

    ludoCtx.fillStyle = '#141b38'; ludoCtx.fillRect(0,0,w,h);

    function drawHomeQuadrant(r0,c0,color){
      ludoCtx.fillStyle = color;
      ludoCtx.globalAlpha = 0.22;
      ludoCtx.fillRect(c0*cell, r0*cell, cell*6, cell*6);
      ludoCtx.globalAlpha = 1;
      ludoCtx.strokeStyle = 'rgba(217,179,120,0.4)'; ludoCtx.lineWidth = 1.5;
      ludoCtx.strokeRect(c0*cell, r0*cell, cell*6, cell*6);
      ludoCtx.fillStyle = color; ludoCtx.globalAlpha = 0.35;
      if(ludoCtx.roundRect){
        ludoCtx.beginPath();
        ludoCtx.roundRect((c0+1.2)*cell,(r0+1.2)*cell, cell*3.6, cell*3.6, cell*0.4);
        ludoCtx.fill();
      } else {
        ludoCtx.fillRect((c0+1.2)*cell,(r0+1.2)*cell, cell*3.6, cell*3.6);
      }
      ludoCtx.globalAlpha = 1;
    }
    drawHomeQuadrant(0,0, LUDO_COLOR.Sahil);
    drawHomeQuadrant(9,9, LUDO_COLOR.Ananya);
    ludoCtx.fillStyle = 'rgba(20,27,56,0.9)';
    ludoCtx.fillRect(0,9*cell,cell*6,cell*6);
    ludoCtx.fillRect(9*cell,0,cell*6,cell*6);
    ludoCtx.strokeStyle = 'rgba(217,179,120,0.25)'; ludoCtx.lineWidth = 1;
    ludoCtx.strokeRect(0,9*cell,cell*6,cell*6);
    ludoCtx.strokeRect(9*cell,0,cell*6,cell*6);

    LUDO_PATH_RC.forEach(function(rc, i){
      const isSafe = LUDO_SAFE.indexOf(i)!==-1;
      ludoCtx.fillStyle = isSafe ? 'rgba(217,179,120,0.4)' : ((i%2===0)?'rgba(30,38,70,0.95)':'rgba(20,27,56,0.95)');
      ludoCtx.fillRect(rc[1]*cell, rc[0]*cell, cell, cell);
      ludoCtx.strokeStyle = 'rgba(217,179,120,0.15)'; ludoCtx.lineWidth = 1;
      ludoCtx.strokeRect(rc[1]*cell, rc[0]*cell, cell, cell);
      if(isSafe){
        ludoCtx.fillStyle = '#d9b378';
        ludoCtx.font = (cell*0.55)+'px sans-serif';
        ludoCtx.textAlign='center'; ludoCtx.textBaseline='middle';
        ludoCtx.fillText('\u2605', rc[1]*cell+cell/2, rc[0]*cell+cell/2);
      }
    });

    ['Sahil','Ananya'].forEach(function(name){
      LUDO_HOME_COL_RC[name].forEach(function(rc, i){
        ludoCtx.fillStyle = LUDO_COLOR[name];
        ludoCtx.globalAlpha = 0.3 + i*0.08;
        ludoCtx.fillRect(rc[1]*cell, rc[0]*cell, cell, cell);
        ludoCtx.globalAlpha = 1;
        ludoCtx.strokeStyle = 'rgba(217,179,120,0.2)'; ludoCtx.lineWidth = 1;
        ludoCtx.strokeRect(rc[1]*cell, rc[0]*cell, cell, cell);
      });
    });

    ludoCtx.fillStyle = 'rgba(217,179,120,0.25)';
    ludoCtx.beginPath();
    ludoCtx.arc(7.5*cell, 7.5*cell, cell*1.5, 0, Math.PI*2);
    ludoCtx.fill();
    ludoCtx.font = (cell*1.1)+'px sans-serif';
    ludoCtx.textAlign='center'; ludoCtx.textBaseline='middle';
    ludoCtx.fillText('\u2764\uFE0F', 7.5*cell, 7.5*cell);

    ['Sahil','Ananya'].forEach(function(name){
      const rc = LUDO_PATH_RC[LUDO_START[name]];
      ludoCtx.fillStyle = LUDO_COLOR[name];
      ludoCtx.globalAlpha = 0.55;
      ludoCtx.fillRect(rc[1]*cell, rc[0]*cell, cell, cell);
      ludoCtx.globalAlpha = 1;
    });

    ['Sahil','Ananya'].forEach(function(name){
      const tokens = state.tokens[name] || [];
      const color = LUDO_COLOR[name];
      tokens.forEach(function(tok, ti){
        let pt;
        if(tok.pos === -1){
          const base = LUDO_HOME_BASE_RC[name];
          const ox = ti===0 ? -0.7 : 0.7, oy = ti===0 ? -0.7 : 0.7;
          pt = ludoRcToXY(base[0]+oy, base[1]+ox);
        } else if(tok.homeSteps >= LUDO_HOME_STRETCH){
          pt = ludoRcToXY(7.5, 7.5);
          pt.x += (ti===0? -cell*0.35 : cell*0.35);
        } else if(tok.homeSteps > 0){
          const rc = LUDO_HOME_COL_RC[name][tok.homeSteps-1];
          pt = ludoRcToXY(rc[0], rc[1]);
        } else {
          const trackIdx = (LUDO_START[name] + tok.pos) % LUDO_TRACK_LEN;
          const rc = LUDO_PATH_RC[trackIdx];
          pt = ludoRcToXY(rc[0], rc[1]);
        }
        const off = ti===1 ? cell*0.18 : -cell*0.18;
        ludoCtx.beginPath();
        ludoCtx.fillStyle = color;
        ludoCtx.strokeStyle = '#f6eeda'; ludoCtx.lineWidth = 2;
        ludoCtx.arc(pt.x+off, pt.y, cell*0.28, 0, Math.PI*2);
        ludoCtx.fill(); ludoCtx.stroke();
      });
    });

    ludoDiceEl.textContent = state.lastRoll ? DICE_FACES[state.lastRoll] : '?';
    if(state.winner){
      ludoStatusEl.textContent = (state.winner===myName) ? 'You won! 🎉' : (state.winner + ' won!');
      ludoRollBtn.disabled = true;
    } else {
      ludoStatusEl.textContent = (state.turn===myName) ? 'Your turn — roll the dice' : (otherPersonName()+"'s turn");
      ludoRollBtn.disabled = (state.turn!==myName);
    }
  }

  function ludoMovableTokens(tokens, roll){
    const idxs = [];
    tokens.forEach(function(t,i){
      if(t.pos===-1){ if(roll===6) idxs.push(i); }
      else if(t.homeSteps < LUDO_HOME_STRETCH){
        if(t.homeSteps + roll <= LUDO_HOME_STRETCH) idxs.push(i);
      }
    });
    return idxs;
  }

  ludoRollBtn.addEventListener('click', function(){
    if(ludoRollBtn.disabled) return;
    ludoRollBtn.disabled = true;
    db.ref('games/ludo').once('value').then(function(snap){
      const state = snap.val();
      if(!state || state.winner || state.turn !== myName) return;
      const roll = 1 + Math.floor(Math.random()*6);
      const myTokens = state.tokens[myName];
      const movable = ludoMovableTokens(myTokens, roll);
      if(movable.length === 0){
        db.ref('games/ludo').update({ lastRoll: roll, turn: otherPersonName() });
        return;
      }
      if(movable.length === 1){
        ludoApplyMove(state, movable[0], roll);
      } else {
        db.ref('games/ludo/lastRoll').set(roll);
        ludoSelectedState = { state: state, roll: roll, options: movable };
        ludoStatusEl.textContent = 'Tap a token to move it';
        showToast('You have multiple movable tokens — moving token ' + (movable[0]+1) + '.');
        ludoApplyMove(state, movable[0], roll);
      }
    }).catch(function(){ ludoRollBtn.disabled = false; });
  });

  function ludoApplyMove(state, tokenIdx, roll){
    const myTokens = JSON.parse(JSON.stringify(state.tokens[myName]));
    const tok = myTokens[tokenIdx];
    if(tok.pos === -1){ tok.pos = 0; }
    else if(tok.homeSteps > 0){ tok.homeSteps += roll; }
    else {
      tok.pos += roll;
      if(tok.pos >= 51){ tok.homeSteps = tok.pos - 51; tok.pos = 51; }
    }
    const updates = {};
    let captured = false;
    if(tok.pos >= 0 && tok.pos < 51 && tok.homeSteps === 0){
      const myTrackIdx = (LUDO_START[myName] + tok.pos) % LUDO_TRACK_LEN;
      if(LUDO_SAFE.indexOf(myTrackIdx) === -1){
        const oppName = otherPersonName();
        const oppTokens = JSON.parse(JSON.stringify(state.tokens[oppName]));
        oppTokens.forEach(function(ot){
          if(ot.pos >= 0 && ot.homeSteps === 0){
            const oppTrackIdx = (LUDO_START[oppName] + ot.pos) % LUDO_TRACK_LEN;
            if(oppTrackIdx === myTrackIdx){ ot.pos = -1; captured = true; }
          }
        });
        if(captured) updates['tokens/' + oppName] = oppTokens;
      }
    }
    updates['tokens/' + myName] = myTokens;
    updates['lastRoll'] = roll;
    const allHome = myTokens.every(function(t){ return t.homeSteps >= LUDO_HOME_STRETCH; });
    if(allHome) updates['winner'] = myName;
    updates['turn'] = (roll===6 && !allHome) ? myName : otherPersonName();
    db.ref('games/ludo').update(updates);
  }

  document.getElementById('ludoResetBtn').addEventListener('click', function(){
    db.ref('games/ludo').set({ tokens: { Sahil: ludoInitTokens(), Ananya: ludoInitTokens() }, turn: 'Sahil', lastRoll: null, winner: null });
  });

  /* ---------------- SHARED 2D PHYSICS (Carrom + Pool) ---------------- */
  function shadeColor(hex, percent){
    if(!hex || hex[0] !== '#') return hex;
    let num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) + percent, g = ((num >> 8) & 0x00FF) + percent, b = (num & 0x0000FF) + percent;
    r = Math.min(255, Math.max(0,r)); g = Math.min(255, Math.max(0,g)); b = Math.min(255, Math.max(0,b));
    return '#' + (0x1000000 + r*0x10000 + g*0x100 + b).toString(16).slice(1);
  }

  function physStep(pieces, W, H, friction){
    pieces.forEach(function(p){
      if(!p.active) return;
      p.vx *= friction; p.vy *= friction;
      if(Math.hypot(p.vx,p.vy) < 0.04){ p.vx = 0; p.vy = 0; }
      p.x += p.vx; p.y += p.vy;
      if(p.x - p.r < 0){ p.x = p.r; p.vx = -p.vx*0.82; }
      if(p.x + p.r > W){ p.x = W - p.r; p.vx = -p.vx*0.82; }
      if(p.y - p.r < 0){ p.y = p.r; p.vy = -p.vy*0.82; }
      if(p.y + p.r > H){ p.y = H - p.r; p.vy = -p.vy*0.82; }
    });
    for(let i=0;i<pieces.length;i++){
      if(!pieces[i].active) continue;
      for(let j=i+1;j<pieces.length;j++){
        if(!pieces[j].active) continue;
        const a=pieces[i], b=pieces[j];
        const dx=b.x-a.x, dy=b.y-a.y;
        const dist=Math.hypot(dx,dy);
        const minDist=a.r+b.r;
        if(dist>0 && dist<minDist){
          const nx=dx/dist, ny=dy/dist;
          const overlap=(minDist-dist)/2;
          a.x -= nx*overlap; a.y -= ny*overlap;
          b.x += nx*overlap; b.y += ny*overlap;
          const rvx=b.vx-a.vx, rvy=b.vy-a.vy;
          const velAlongNormal = rvx*nx+rvy*ny;
          if(velAlongNormal<0){
            const impulse = -1.88*velAlongNormal/2;
            a.vx -= impulse*nx; a.vy -= impulse*ny;
            b.vx += impulse*nx; b.vy += impulse*ny;
          }
        }
      }
    }
  }
  function physAnyMoving(pieces){
    return pieces.some(function(p){ return p.active && (Math.abs(p.vx)>0.04||Math.abs(p.vy)>0.04); });
  }
  function physCheckPockets(pieces, pockets, pocketR){
    const potted = [];
    pieces.forEach(function(p){
      if(!p.active) return;
      pockets.forEach(function(pk){
        if(Math.hypot(p.x-pk.x, p.y-pk.y) < pocketR){ p.active = false; p.vx=0; p.vy=0; potted.push(p.id); }
      });
    });
    return potted;
  }

  /* ---------------- CARROM ---------------- */
  document.getElementById('carromCloseBtn').addEventListener('click', closeAllGameScreens);
  const carromCanvas = document.getElementById('carromCanvas');
  const carromCtx = carromCanvas.getContext('2d');
  const carromStatusEl = document.getElementById('carromStatus');
  const carromScoreEl = document.getElementById('carromScore');
  let carromRafId = null;
  let carromPieces = [];
  let carromW = 300, carromH = 300;
  let carromAiming = false, carromAimStart = null, carromDragPt = null;
  let carromShotRunning = false;
  let carromLastSync = 0;

  function carromSizeCanvas(){
    const rect = carromCanvas.getBoundingClientRect();
    carromCanvas.width = rect.width; carromCanvas.height = rect.height;
    carromW = rect.width; carromH = rect.height;
  }
  window.addEventListener('resize', function(){ if(carromEl.classList.contains('show')) carromSizeCanvas(); });

  function carromInitPieces(){
    const cx = carromW/2, cy = carromH/2;
    const r = Math.min(carromW,carromH) * 0.028;
    const pieces = [];
    pieces.push({ id:'queen', x:cx, y:cy, vx:0, vy:0, r:r*1.05, color:'#c23a54', active:true, scored:false });
    const ringR = r*2.3;
    for(let i=0;i<8;i++){
      const ang = (i/8)*Math.PI*2;
      pieces.push({
        id: 'c'+i, x: cx+ringR*Math.cos(ang), y: cy+ringR*Math.sin(ang),
        vx:0, vy:0, r:r, color: (i%2===0)?'#1a1424':'#f6eeda', active:true, scored:false,
        colorName: (i%2===0)?'black':'white'
      });
    }
    pieces.push({ id:'striker', x:cx, y:carromH - r*3, vx:0, vy:0, r:r*1.15, color:'#e8c896', active:true, isStriker:true });
    return pieces;
  }

  function carromPockets(){
    const m = Math.min(carromW,carromH)*0.06;
    return [ {x:m,y:m}, {x:carromW-m,y:m}, {x:m,y:carromH-m}, {x:carromW-m,y:carromH-m} ];
  }

  function openCarrom(){
    carromEl.classList.add('show');
    carromSizeCanvas();
    const ref = db.ref('games/carrom');
    carromListenerRef = ref;
    ref.once('value').then(function(snap){
      if(!snap.exists()){
        ref.set({
          coins: carromInitPieces(), turn: 'Sahil', scores: { Sahil:0, Ananya:0 },
          assignedColor: { Sahil:null, Ananya:null }, queenPending:false, winner:null, shotInProgress:false
        });
      }
    });
    ref.on('value', function(snap){
      const state = snap.val();
      if(!state) return;
      if(!carromShotRunning){
        carromPieces = (state.shotInProgress && state.liveCoins) ? state.liveCoins : state.coins;
        carromDraw();
      }
      carromUpdateStatus(state);
    });
  }

  function carromUpdateStatus(state){
    const sc = state.scores || {Sahil:0,Ananya:0};
    const ac = state.assignedColor || {};
    carromScoreEl.textContent = 'Sahil (' + (ac.Sahil||'?') + '): ' + sc.Sahil + '   —   Ananya (' + (ac.Ananya||'?') + '): ' + sc.Ananya;
    if(state.winner){
      carromStatusEl.textContent = (state.winner===myName) ? 'You won! 🎉' : (state.winner + ' won!');
    } else if(state.shotInProgress){
      carromStatusEl.textContent = 'Shot in progress...';
    } else {
      carromStatusEl.textContent = (state.turn===myName) ? 'Your shot — drag the striker back and release' : (otherPersonName() + "'s turn");
    }
  }

  function carromDraw(){
    carromCtx.clearRect(0,0,carromW,carromH);
    const m = Math.min(carromW,carromH);
    const border = m*0.05;

    const frameGrad = carromCtx.createLinearGradient(0,0,carromW,carromH);
    frameGrad.addColorStop(0,'#5c3a1e'); frameGrad.addColorStop(1,'#3e2712');
    carromCtx.fillStyle = frameGrad; carromCtx.fillRect(0,0,carromW,carromH);

    const surfGrad = carromCtx.createLinearGradient(border,border,carromW-border,carromH-border);
    surfGrad.addColorStop(0,'#e8c48a'); surfGrad.addColorStop(1,'#d9a860');
    carromCtx.fillStyle = surfGrad;
    carromCtx.fillRect(border, border, carromW-border*2, carromH-border*2);
    carromCtx.strokeStyle = 'rgba(122,31,51,0.55)'; carromCtx.lineWidth = 2;
    carromCtx.strokeRect(border, border, carromW-border*2, carromH-border*2);

    const pocketR = m*0.045;
    const cornerIn = border + pocketR*1.6;

    function drawCornerMark(px, py, dirX, dirY){
      carromCtx.strokeStyle = 'rgba(122,31,51,0.6)'; carromCtx.lineWidth = 1.5;
      carromCtx.beginPath();
      carromCtx.moveTo(px, py);
      carromCtx.lineTo(px + dirX*m*0.09, py);
      carromCtx.moveTo(px, py);
      carromCtx.lineTo(px, py + dirY*m*0.09);
      carromCtx.stroke();
      carromCtx.beginPath();
      carromCtx.arc(px, py, pocketR*1.3, 0, Math.PI*2);
      carromCtx.stroke();
    }
    drawCornerMark(cornerIn, cornerIn, 1, 1);
    drawCornerMark(carromW-cornerIn, cornerIn, -1, 1);
    drawCornerMark(cornerIn, carromH-cornerIn, 1, -1);
    drawCornerMark(carromW-cornerIn, carromH-cornerIn, -1, -1);

    const baseInset = m*0.16;
    carromCtx.strokeStyle = 'rgba(122,31,51,0.5)'; carromCtx.lineWidth = 1.5;
    [
      [border+baseInset*0.6, baseInset, carromW-border-baseInset*0.6, baseInset],
      [border+baseInset*0.6, carromH-baseInset, carromW-border-baseInset*0.6, carromH-baseInset],
      [baseInset, border+baseInset*0.6, baseInset, carromH-border-baseInset*0.6],
      [carromW-baseInset, border+baseInset*0.6, carromW-baseInset, carromH-border-baseInset*0.6]
    ].forEach(function(l){
      carromCtx.beginPath(); carromCtx.moveTo(l[0],l[1]); carromCtx.lineTo(l[2],l[3]); carromCtx.stroke();
    });
    [[carromW/2,baseInset],[carromW/2,carromH-baseInset],[baseInset,carromH/2],[carromW-baseInset,carromH/2]].forEach(function(p){
      carromCtx.beginPath(); carromCtx.arc(p[0],p[1],3,0,Math.PI*2);
      carromCtx.fillStyle = 'rgba(122,31,51,0.6)'; carromCtx.fill();
    });

    carromCtx.strokeStyle = 'rgba(122,31,51,0.55)'; carromCtx.lineWidth = 1.5;
    carromCtx.beginPath(); carromCtx.arc(carromW/2, carromH/2, m*0.22, 0, Math.PI*2); carromCtx.stroke();
    carromCtx.beginPath(); carromCtx.arc(carromW/2, carromH/2, m*0.03, 0, Math.PI*2); carromCtx.stroke();

    carromPockets().forEach(function(pk){
      const pg = carromCtx.createRadialGradient(pk.x,pk.y,0,pk.x,pk.y,pocketR);
      pg.addColorStop(0,'#000'); pg.addColorStop(1,'#1a1414');
      carromCtx.fillStyle = pg;
      carromCtx.beginPath(); carromCtx.arc(pk.x,pk.y,pocketR,0,Math.PI*2); carromCtx.fill();
    });

    carromPieces.forEach(function(p){
      if(!p.active) return;
      const pg = carromCtx.createRadialGradient(p.x-p.r*0.3,p.y-p.r*0.3,p.r*0.1,p.x,p.y,p.r);
      if(p.isStriker){ pg.addColorStop(0,'#fff5da'); pg.addColorStop(1,p.color); }
      else if(p.color === '#f6eeda'){ pg.addColorStop(0,'#ffffff'); pg.addColorStop(1,'#e0d5bc'); }
      else if(p.id === 'queen'){ pg.addColorStop(0,'#e8607a'); pg.addColorStop(1,p.color); }
      else { pg.addColorStop(0,'#3a3242'); pg.addColorStop(1,p.color); }
      carromCtx.beginPath();
      carromCtx.fillStyle = pg;
      carromCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
      carromCtx.fill();
      carromCtx.strokeStyle = 'rgba(0,0,0,0.4)'; carromCtx.lineWidth = 1;
      carromCtx.stroke();
    });

    if(carromAiming && carromDragPt){
      const striker = carromPieces.find(function(p){ return p.isStriker; });
      if(striker){
        carromCtx.strokeStyle = 'rgba(122,31,51,0.85)'; carromCtx.lineWidth = 2;
        carromCtx.setLineDash([6,6]);
        carromCtx.beginPath();
        carromCtx.moveTo(striker.x, striker.y);
        const dx = striker.x - carromDragPt.x, dy = striker.y - carromDragPt.y;
        carromCtx.lineTo(striker.x + dx*2, striker.y + dy*2);
        carromCtx.stroke();
        carromCtx.setLineDash([]);
      }
    }
  }

  function carromPointerPos(e){
    const rect = carromCanvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx-rect.left, y: cy-rect.top };
  }

  function carromCanShoot(){
    return carromPieces.length && !carromShotRunning;
  }

  carromCanvas.addEventListener('mousedown', carromStartAim);
  carromCanvas.addEventListener('touchstart', function(e){ e.preventDefault(); carromStartAim(e); });
  carromCanvas.addEventListener('mousemove', carromMoveAim);
  carromCanvas.addEventListener('touchmove', function(e){ e.preventDefault(); carromMoveAim(e); });
  carromCanvas.addEventListener('mouseup', carromReleaseAim);
  carromCanvas.addEventListener('touchend', function(e){ e.preventDefault(); carromReleaseAim(); });

  function carromStartAim(e){
    db.ref('games/carrom').once('value').then(function(snap){
      const state = snap.val();
      if(!state || state.turn !== myName || state.winner || carromShotRunning) return;
      const striker = carromPieces.find(function(p){ return p.isStriker; });
      if(!striker) return;
      const pos = carromPointerPos(e);
      if(Math.hypot(pos.x-striker.x, pos.y-striker.y) < striker.r*4){
        carromAiming = true;
      }
    });
  }
  function carromMoveAim(e){
    if(!carromAiming) return;
    carromDragPt = carromPointerPos(e);
    carromDraw();
  }
  function carromReleaseAim(){
    if(!carromAiming || !carromDragPt) { carromAiming = false; return; }
    const striker = carromPieces.find(function(p){ return p.isStriker; });
    carromAiming = false;
    const dx = striker.x - carromDragPt.x, dy = striker.y - carromDragPt.y;
    const dist = Math.hypot(dx,dy);
    if(dist < 5){ carromDragPt = null; return; }
    const power = Math.min(dist * 0.16, 14);
    striker.vx = (dx/dist) * power;
    striker.vy = (dy/dist) * power;
    carromDragPt = null;
    carromRunShot();
  }

  function carromRunShot(){
    carromShotRunning = true;
    db.ref('games/carrom').update({ shotInProgress: true });
    let settleFrames = 0;
    function loop(ts){
      physStep(carromPieces, carromW, carromH, 0.985);
      const pockets = carromPockets();
      const potted = physCheckPockets(carromPieces, pockets, Math.min(carromW,carromH)*0.045);
      carromDraw();
      if(!physAnyMoving(carromPieces)){ settleFrames++; } else { settleFrames = 0; }
      if(ts - carromLastSync > 90){
        carromLastSync = ts;
        db.ref('games/carrom/liveCoins').set(carromPieces.map(function(p){ return {id:p.id,x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,vx:0,vy:0,r:p.r,color:p.color,active:p.active,isStriker:!!p.isStriker,colorName:p.colorName||null}; }));
      }
      if(settleFrames > 20){
        carromFinishShot(potted);
        return;
      }
      carromRafId = requestAnimationFrame(loop);
    }
    carromRafId = requestAnimationFrame(loop);
  }

  function carromFinishShot(pottedIdsAllFrames){
    db.ref('games/carrom').once('value').then(function(snap){
      const state = snap.val();
      const scores = state.scores || {Sahil:0,Ananya:0};
      const assignedColor = state.assignedColor || {Sahil:null,Ananya:null};
      let queenPending = state.queenPending;
      let winner = null;
      let potThisTurn = false;

      const striker = carromPieces.find(function(p){ return p.isStriker; });
      if(striker && !striker.active){
        striker.active = true; striker.x = carromW/2; striker.y = carromH - striker.r*3; striker.vx=0; striker.vy=0;
      }

      carromPieces.forEach(function(p){
        if(p.active || p.isStriker || p.scored) return;
        p.scored = true;
        if(p.id === 'queen'){
          queenPending = true;
          scores[myName] += 3;
          queenPending = false;
          potThisTurn = true;
        } else {
          if(!assignedColor.Sahil && !assignedColor.Ananya){
            assignedColor[myName] = p.colorName;
            assignedColor[otherPersonName()] = (p.colorName === 'black') ? 'white' : 'black';
          }
          const owner = (assignedColor[myName] === p.colorName) ? myName : otherPersonName();
          scores[owner] += 1;
          if(owner === myName) potThisTurn = true;
        }
      });

      const myColor = assignedColor[myName];
      if(myColor){
        const remaining = carromPieces.filter(function(p){ return p.colorName === myColor && p.active; }).length;
        if(remaining === 0) winner = myName;
      }

      const finalCoins = carromPieces.map(function(p){
        return { id:p.id, x:p.x, y:p.y, vx:0, vy:0, r:p.r, color:p.color, active:p.active, scored:!!p.scored, isStriker:!!p.isStriker, colorName:p.colorName||null };
      });

      const updates = {
        coins: finalCoins, scores: scores, assignedColor: assignedColor,
        queenPending: queenPending, shotInProgress:false, liveCoins:null,
        turn: potThisTurn ? myName : otherPersonName()
      };
      if(winner) updates.winner = winner;
      db.ref('games/carrom').update(updates).then(function(){
        carromShotRunning = false;
      });
    });
  }

  document.getElementById('carromResetBtn').addEventListener('click', function(){
    db.ref('games/carrom').set({
      coins: carromInitPieces(), turn: 'Sahil', scores: { Sahil:0, Ananya:0 },
      assignedColor: { Sahil:null, Ananya:null }, queenPending:false, winner:null, shotInProgress:false
    });
  });

  /* ---------------- 8 BALL POOL ---------------- */
  document.getElementById('poolCloseBtn').addEventListener('click', closeAllGameScreens);
  const poolCanvas = document.getElementById('poolCanvas');
  const poolCtx = poolCanvas.getContext('2d');
  const poolStatusEl = document.getElementById('poolStatus');
  let poolRafId = null;
  let poolPieces = [];
  let poolW = 300, poolH = 150;
  let poolAiming = false, poolDragPt = null;
  let poolShotRunning = false;
  let poolLastSync = 0;

  const POOL_COLORS = ['#d94b2b','#2b64d9','#c23a54','#8a5a34','#e8a62b','#2f9e55','#7a1f33'];

  function poolSizeCanvas(){
    const rect = poolCanvas.getBoundingClientRect();
    poolCanvas.width = rect.width; poolCanvas.height = rect.width/2;
    poolW = poolCanvas.width; poolH = poolCanvas.height;
    poolCanvas.style.height = poolH + 'px';
  }
  window.addEventListener('resize', function(){ if(poolEl.classList.contains('show')) poolSizeCanvas(); });

  function poolInitPieces(){
    const r = poolW * 0.018;
    const pieces = [];
    pieces.push({ id:'cue', x: poolW*0.25, y: poolH/2, vx:0, vy:0, r:r, color:'#f6eeda', active:true, isCue:true });
    const apexX = poolW*0.7, apexY = poolH/2;
    let num = 1;
    const order = [1,9,2,10,8,3,11,4,12,5,13,6,14,7,15];
    let oi = 0;
    for(let row=0; row<5; row++){
      for(let col=0; col<=row; col++){
        const n = order[oi++];
        const isStripe = n >= 9;
        const baseColor = POOL_COLORS[(n>=9? n-9 : n-1) % 7];
        pieces.push({
          id:'b'+n, num:n, x: apexX + row*(r*1.8), y: apexY - row*r + col*r*2,
          vx:0, vy:0, r:r, color: (n===8)?'#111':baseColor, active:true, scored:false,
          group: (n===8)?'eight':(isStripe?'stripe':'solid'), isStripe: isStripe
        });
      }
    }
    return pieces;
  }

  function poolPockets(){
    const m = poolW*0.02;
    return [
      {x:m,y:m}, {x:poolW/2,y:m*0.6}, {x:poolW-m,y:m},
      {x:m,y:poolH-m}, {x:poolW/2,y:poolH-m*0.6}, {x:poolW-m,y:poolH-m}
    ];
  }

  function openPool(){
    poolEl.classList.add('show');
    poolSizeCanvas();
    const ref = db.ref('games/pool');
    poolListenerRef = ref;
    ref.once('value').then(function(snap){
      if(!snap.exists()){
        ref.set({ balls: poolInitPieces(), turn:'Sahil', assignedGroup:{Sahil:null,Ananya:null}, winner:null, shotInProgress:false });
      }
    });
    ref.on('value', function(snap){
      const state = snap.val();
      if(!state) return;
      if(!poolShotRunning){
        poolPieces = (state.shotInProgress && state.liveBalls) ? state.liveBalls : state.balls;
        poolDraw();
      }
      poolUpdateStatus(state);
    });
  }

  function poolUpdateStatus(state){
    const ag = state.assignedGroup || {};
    if(state.winner){
      poolStatusEl.textContent = (state.winner===myName) ? 'You won! 🎉' : (state.winner + ' won!');
    } else if(state.shotInProgress){
      poolStatusEl.textContent = 'Shot in progress...';
    } else {
      const myGroup = ag[myName] ? (' — you: ' + ag[myName]) : '';
      poolStatusEl.textContent = (state.turn===myName) ? ('Your shot' + myGroup) : (otherPersonName() + "'s turn");
    }
  }

  function poolDraw(){
    poolCtx.clearRect(0,0,poolW,poolH);
    const railW = poolW*0.035;

    const railGrad = poolCtx.createLinearGradient(0,0,poolW,poolH);
    railGrad.addColorStop(0,'#4a2e15'); railGrad.addColorStop(1,'#2e1c0c');
    poolCtx.fillStyle = railGrad; poolCtx.fillRect(0,0,poolW,poolH);

    const feltGrad = poolCtx.createLinearGradient(railW,railW,poolW-railW,poolH-railW);
    feltGrad.addColorStop(0,'#0f7a44'); feltGrad.addColorStop(1,'#0a5c34');
    poolCtx.fillStyle = feltGrad;
    poolCtx.fillRect(railW, railW, poolW-railW*2, poolH-railW*2);
    poolCtx.strokeStyle = 'rgba(217,179,120,0.5)'; poolCtx.lineWidth = 2;
    poolCtx.strokeRect(railW, railW, poolW-railW*2, poolH-railW*2);

    poolCtx.strokeStyle = 'rgba(217,179,120,0.25)'; poolCtx.lineWidth = 1;
    poolCtx.beginPath(); poolCtx.moveTo(poolW*0.28, railW); poolCtx.lineTo(poolW*0.28, poolH-railW); poolCtx.stroke();
    poolCtx.beginPath(); poolCtx.arc(poolW*0.28, poolH/2, 3, 0, Math.PI*2); poolCtx.fillStyle='rgba(217,179,120,0.4)'; poolCtx.fill();

    poolPockets().forEach(function(pk){
      const pg = poolCtx.createRadialGradient(pk.x,pk.y,0,pk.x,pk.y,poolW*0.024);
      pg.addColorStop(0,'#000'); pg.addColorStop(0.7,'#111'); pg.addColorStop(1,'#3a2a15');
      poolCtx.fillStyle = pg;
      poolCtx.beginPath(); poolCtx.arc(pk.x,pk.y,poolW*0.024,0,Math.PI*2); poolCtx.fill();
    });

    poolPieces.forEach(function(p){
      if(!p.active) return;
      const pg = poolCtx.createRadialGradient(p.x-p.r*0.3,p.y-p.r*0.3,p.r*0.1,p.x,p.y,p.r);
      pg.addColorStop(0, p.isCue ? '#ffffff' : shadeColor(p.color, 40));
      pg.addColorStop(1, p.color);
      poolCtx.beginPath();
      poolCtx.fillStyle = pg;
      poolCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
      poolCtx.fill();
      if(p.isStripe){
        poolCtx.fillStyle = '#f6eeda';
        poolCtx.beginPath(); poolCtx.rect(p.x-p.r, p.y-p.r*0.35, p.r*2, p.r*0.7); poolCtx.fill();
      }
      if(p.num){
        poolCtx.beginPath(); poolCtx.fillStyle = '#f6eeda';
        poolCtx.arc(p.x, p.y, p.r*0.62, 0, Math.PI*2); poolCtx.fill();
        poolCtx.fillStyle = '#1a1424';
        poolCtx.font = 'bold ' + (p.r*0.9) + 'px sans-serif';
        poolCtx.textAlign = 'center'; poolCtx.textBaseline = 'middle';
        poolCtx.fillText(p.num, p.x, p.y);
      }
      poolCtx.strokeStyle = 'rgba(0,0,0,0.4)'; poolCtx.lineWidth = 1; poolCtx.stroke();
    });

    if(poolAiming && poolDragPt){
      const cue = poolPieces.find(function(p){ return p.isCue; });
      if(cue){
        poolCtx.strokeStyle = 'rgba(255,255,255,0.8)'; poolCtx.lineWidth = 2;
        poolCtx.setLineDash([6,6]);
        poolCtx.beginPath();
        poolCtx.moveTo(cue.x, cue.y);
        const dx = cue.x - poolDragPt.x, dy = cue.y - poolDragPt.y;
        poolCtx.lineTo(cue.x + dx*2.5, cue.y + dy*2.5);
        poolCtx.stroke();
        poolCtx.setLineDash([]);
      }
    }
  }

  function poolPointerPos(e){
    const rect = poolCanvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx-rect.left)*(poolW/rect.width), y: (cy-rect.top)*(poolH/rect.height) };
  }

  poolCanvas.addEventListener('mousedown', poolStartAim);
  poolCanvas.addEventListener('touchstart', function(e){ e.preventDefault(); poolStartAim(e); });
  poolCanvas.addEventListener('mousemove', poolMoveAim);
  poolCanvas.addEventListener('touchmove', function(e){ e.preventDefault(); poolMoveAim(e); });
  poolCanvas.addEventListener('mouseup', poolReleaseAim);
  poolCanvas.addEventListener('touchend', function(e){ e.preventDefault(); poolReleaseAim(); });

  function poolStartAim(e){
    db.ref('games/pool').once('value').then(function(snap){
      const state = snap.val();
      if(!state || state.turn !== myName || state.winner || poolShotRunning) return;
      const cue = poolPieces.find(function(p){ return p.isCue; });
      if(!cue || !cue.active) return;
      const pos = poolPointerPos(e);
      if(Math.hypot(pos.x-cue.x, pos.y-cue.y) < cue.r*5){ poolAiming = true; }
    });
  }
  function poolMoveAim(e){ if(!poolAiming) return; poolDragPt = poolPointerPos(e); poolDraw(); }
  function poolReleaseAim(){
    if(!poolAiming || !poolDragPt){ poolAiming = false; return; }
    const cue = poolPieces.find(function(p){ return p.isCue; });
    poolAiming = false;
    const dx = cue.x - poolDragPt.x, dy = cue.y - poolDragPt.y;
    const dist = Math.hypot(dx,dy);
    if(dist < 5){ poolDragPt = null; return; }
    const power = Math.min(dist * 0.13, 13);
    cue.vx = (dx/dist)*power; cue.vy = (dy/dist)*power;
    poolDragPt = null;
    poolRunShot();
  }

  function poolRunShot(){
    poolShotRunning = true;
    db.ref('games/pool').update({ shotInProgress:true });
    let settleFrames = 0;
    function loop(ts){
      physStep(poolPieces, poolW, poolH, 0.988);
      const potted = physCheckPockets(poolPieces, poolPockets(), poolW*0.024);
      poolDraw();
      if(!physAnyMoving(poolPieces)){ settleFrames++; } else { settleFrames = 0; }
      if(ts - poolLastSync > 90){
        poolLastSync = ts;
        db.ref('games/pool/liveBalls').set(poolPieces.map(function(p){
          return {id:p.id,num:p.num||null,x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,vx:0,vy:0,r:p.r,color:p.color,active:p.active,isCue:!!p.isCue,isStripe:!!p.isStripe,group:p.group||null};
        }));
      }
      if(settleFrames > 20){ poolFinishShot(); return; }
      poolRafId = requestAnimationFrame(loop);
    }
    poolRafId = requestAnimationFrame(loop);
  }

  function poolFinishShot(){
    db.ref('games/pool').once('value').then(function(snap){
      const state = snap.val();
      const assignedGroup = state.assignedGroup || {Sahil:null,Ananya:null};
      let winner = null, potThisTurn = false, scratched = false, potted8Early = false;

      const cue = poolPieces.find(function(p){ return p.isCue; });
      if(cue && !cue.active){
        scratched = true;
        cue.active = true; cue.x = poolW*0.25; cue.y = poolH/2; cue.vx=0; cue.vy=0;
      }

      poolPieces.forEach(function(p){
        if(p.active || p.isCue || p.scored) return;
        p.scored = true;
        if(p.group === 'eight'){
          const myGroup = assignedGroup[myName];
          const myRemaining = poolPieces.filter(function(x){ return x.group===myGroup && x.active; }).length;
          if(!myGroup || myRemaining > 0){ potted8Early = true; }
          else { winner = myName; }
          return;
        }
        if(!assignedGroup.Sahil && !assignedGroup.Ananya){
          assignedGroup[myName] = p.group;
          assignedGroup[otherPersonName()] = (p.group==='solid') ? 'stripe' : 'solid';
        }
        const owner = (assignedGroup[myName] === p.group) ? myName : otherPersonName();
        if(owner === myName) potThisTurn = true;
      });

      if(potted8Early) winner = otherPersonName();

      const finalBalls = poolPieces.map(function(p){
        return { id:p.id, num:p.num||null, x:p.x, y:p.y, vx:0, vy:0, r:p.r, color:p.color, active:p.active, scored:!!p.scored, isCue:!!p.isCue, isStripe:!!p.isStripe, group:p.group||null };
      });

      const updates = {
        balls: finalBalls, assignedGroup: assignedGroup, shotInProgress:false, liveBalls:null,
        turn: (potThisTurn && !scratched) ? myName : otherPersonName()
      };
      if(winner) updates.winner = winner;
      db.ref('games/pool').update(updates).then(function(){ poolShotRunning = false; });
    });
  }

  document.getElementById('poolResetBtn').addEventListener('click', function(){
    poolSizeCanvas();
    db.ref('games/pool').set({ balls: poolInitPieces(), turn:'Sahil', assignedGroup:{Sahil:null,Ananya:null}, winner:null, shotInProgress:false });
  });


  const vnEl = document.getElementById('voiceNotes');
  const vnListEl = document.getElementById('vnList');
  const vnRecBtn = document.getElementById('vnRecBtn');
  const vnTimerEl = document.getElementById('vnTimer');
  let vnListenerRef = null;
  let vnRecorder = null;
  let vnChunks = [];
  let vnStream = null;
  let vnStartTs = 0;
  let vnTimerInt = null;

  function openVoiceNotes(){
    vnEl.classList.add('show');
    const ref = db.ref('voiceNotes');
    vnListenerRef = ref;
    ref.on('value', renderVoiceNotes);
  }
  document.getElementById('vnCloseBtn').addEventListener('click', function(){
    vnEl.classList.remove('show');
    if(vnListenerRef){ vnListenerRef.off('value'); vnListenerRef = null; }
    if(vnRecorder && vnRecorder.state === 'recording') vnRecorder.stop();
  });

  function fmtTime(sec){
    const m = Math.floor(sec/60), s = Math.floor(sec%60);
    return m + ':' + (s<10?'0':'') + s;
  }

  function timeAgo(ts){
    if(!ts) return '';
    const diff = Math.floor((Date.now()-ts)/1000);
    if(diff<60) return 'just now';
    if(diff<3600) return Math.floor(diff/60) + 'm ago';
    if(diff<86400) return Math.floor(diff/3600) + 'h ago';
    return Math.floor(diff/86400) + 'd ago';
  }

  function renderVoiceNotes(snap){
    const val = snap.val();
    vnListEl.innerHTML = '';
    if(!val){
      vnListEl.innerHTML = '<div id="vnEmpty">No voice notes yet — record the first one 💫</div>';
      return;
    }
    const entries = Object.keys(val).map(function(k){ return Object.assign({id:k}, val[k]); });
    entries.sort(function(a,b){ return (b.ts||0)-(a.ts||0); });
    entries.forEach(function(note){
      const card = document.createElement('div');
      card.className = 'vnCard';
      const playBtn = document.createElement('button');
      playBtn.className = 'vnPlayBtn';
      playBtn.textContent = '▶';
      const audio = new Audio(note.audioData);
      let playing = false;
      playBtn.addEventListener('click', function(){
        if(playing){ audio.pause(); return; }
        audio.currentTime = 0; audio.play(); playing = true; playBtn.textContent = '⏸';
      });
      audio.addEventListener('ended', function(){ playing = false; playBtn.textContent = '▶'; });
      audio.addEventListener('pause', function(){ playing = false; playBtn.textContent = '▶'; });

      const meta = document.createElement('div');
      meta.className = 'vnMeta';
      meta.innerHTML = '<div class="vnSender">' + note.sender + '</div><div class="vnSub">' +
        fmtTime(note.duration||0) + ' · ' + timeAgo(note.ts) + '</div>';

      card.appendChild(playBtn);
      card.appendChild(meta);

      if(note.sender === myName){
        const delBtn = document.createElement('button');
        delBtn.className = 'vnDelBtn';
        delBtn.textContent = '🗑';
        delBtn.addEventListener('click', function(){
          if(confirm('Delete this voice note?')) db.ref('voiceNotes/' + note.id).remove();
        });
        card.appendChild(delBtn);
      }

      vnListEl.appendChild(card);
    });
  }

  vnRecBtn.addEventListener('click', async function(){
    if(vnRecorder && vnRecorder.state === 'recording'){
      vnRecorder.stop();
      return;
    }
    try{
      vnStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      vnChunks = [];
      vnRecorder = new MediaRecorder(vnStream);
      vnRecorder.ondataavailable = function(e){ if(e.data.size>0) vnChunks.push(e.data); };
      vnRecorder.onstop = function(){
        const durationSec = (Date.now() - vnStartTs) / 1000;
        clearInterval(vnTimerInt);
        vnTimerEl.textContent = '0:00';
        vnRecBtn.classList.remove('recording');
        vnStream.getTracks().forEach(function(t){ t.stop(); });
        const blob = new Blob(vnChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = function(){
          if(durationSec >= 1){
            db.ref('voiceNotes').push({
              sender: myName,
              audioData: reader.result,
              duration: durationSec,
              ts: firebase.database.ServerValue.TIMESTAMP
            });
            logActivityToday();
          }
        };
        reader.readAsDataURL(blob);
      };
      vnRecorder.start();
      vnStartTs = Date.now();
      vnRecBtn.classList.add('recording');
      vnTimerInt = setInterval(function(){
        const sec = (Date.now()-vnStartTs)/1000;
        vnTimerEl.textContent = fmtTime(sec);
        if(sec >= 90){ vnRecorder.stop(); }
      }, 200);
    }catch(e){
      showToast('Microphone access needed to record a voice note.', 'error');
    }
  });

  auth.onAuthStateChanged(function(user){
    if(user){
      myEmail = user.email;
      myName = NAME_MAP[user.email] || user.email;
      loginBtn.disabled = false;
      showChat(myName);
    } else {
      myName = null; myEmail = null;
      showLogin();
    }
  });

  function showLogin(){
    loginEl.style.display='flex';
    chatEl.classList.remove('show');
    stopCallListeners();
  }
  function showChat(name){
    loginEl.style.display='none';
    chatEl.classList.add('show');
    startChat(name);
    startCallListeners(name);
    if('Notification' in window){
      if(Notification.permission==='default'){
        Notification.requestPermission().then(function(perm){
          if(perm === 'granted') registerPushToken(name);
        });
      } else if(Notification.permission === 'granted'){
        registerPushToken(name);
      }
    }
  }

  try{
    db.ref('.info/connected').on('value', function(snap){
      document.querySelectorAll('.conndot').forEach(function(d){
        d.classList.toggle('on', !!snap.val());
      });
    });
  }catch(e){}

  /* ---------------- CHAT ---------------- */
  let pendingFile = null;
  let msgsRef = null;

  const msgsEl = document.getElementById('msgs');
  const textInput = document.getElementById('textInput');
  const sendBtn = document.getElementById('sendBtn');
  const attachBtn = document.getElementById('attachBtn');
  const fileInput = document.getElementById('fileInput');
  const pendingPreview = document.getElementById('pendingPreview');
  const pendingThumb = document.getElementById('pendingThumb');
  const pendingName = document.getElementById('pendingName');
  const pendingRemove = document.getElementById('pendingRemove');

  attachBtn.addEventListener('click', function(){ fileInput.click(); });
  pendingRemove.addEventListener('click', function(){
    pendingFile = null;
    pendingPreview.classList.remove('show');
    fileInput.value = '';
  });

  fileInput.addEventListener('change', function(){
    const f = fileInput.files[0];
    if(!f) return;
    if(f.size > 1.5*1024*1024){
      showToast('Please keep photos/audio/video under 1.5MB so they send smoothly.', 'error');
      fileInput.value=''; return;
    }
    const reader = new FileReader();
    reader.onload = function(){
      const dataUrl = reader.result;
      pendingFile = { dataUrl: dataUrl, contentType: f.type || 'application/octet-stream', fileName: f.name };
      pendingName.textContent = f.name;
      if(f.type.startsWith('image/')){
        pendingThumb.src = dataUrl; pendingThumb.style.display='block';
      } else {
        pendingThumb.style.display='none';
      }
      pendingPreview.classList.add('show');
    };
    reader.readAsDataURL(f);
  });

  textInput.addEventListener('input', function(){
    textInput.style.height='auto';
    textInput.style.height = Math.min(textInput.scrollHeight, 100) + 'px';
  });
  textInput.addEventListener('keydown', function(e){
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }
  });
  sendBtn.addEventListener('click', send);

  let sendInProgress = false;
  async function send(){
    if(sendInProgress) return;
    const text = textInput.value.trim();
    if(!text && !pendingFile) return;
    sendInProgress = true;
    sendBtn.disabled = true;
    try{
      const msg = { sender: myName, text: text || '', ts: Date.now() };
      if(pendingFile){
        msg.fileData = pendingFile.dataUrl;
        msg.fileType = pendingFile.contentType;
        msg.fileName = pendingFile.fileName;
      }
      await msgsRef.push(msg);
      textInput.value=''; textInput.style.height='auto';
      pendingFile=null; pendingPreview.classList.remove('show'); fileInput.value='';
      clearTypingNow();
      logActivityToday();
      sendPush(otherPersonName(), myName, msg.text || (msg.fileName ? '📎 ' + msg.fileName : 'New message'));
    }catch(e){
      showToast('Message could not be sent — check your internet and try again.', 'error');
    }finally{
      sendBtn.disabled=false;
      sendInProgress = false;
    }
  }

  function fileBubbleHtml(m){
    const src = m.fileUrl || m.fileData;
    if(!src) return '';
    const t = m.fileType || '';
    if(t.startsWith('image/')) return '<img src="'+src+'" alt="photo" loading="lazy">';
    if(t.startsWith('video/')) return '<video controls src="'+src+'"></video>';
    if(t.startsWith('audio/')) return '<audio controls src="'+src+'"></audio>';
    return '<a class="fileLink" href="'+src+'" target="_blank" download="'+(m.fileName||'file')+'">&#128206; '+(m.fileName||'file')+'</a>';
  }

  function escapeHtml(s){
    return s.replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  /* ---------------- PRESENCE ---------------- */
  let otherName = null;
  function setupPresence(name){
    otherName = name === 'Sahil' ? 'Ananya' : 'Sahil';
    const myPresenceRef = db.ref('presence/' + name);
    const otherPresenceRef = db.ref('presence/' + otherName);
    db.ref('.info/connected').on('value', function(snap){
      if(snap.val()){
        myPresenceRef.onDisconnect().set({ online:false, lastSeen: firebase.database.ServerValue.TIMESTAMP });
        myPresenceRef.set({ online:true, lastSeen: firebase.database.ServerValue.TIMESTAMP });
      }
    });
    otherPresenceRef.on('value', function(snap){
      const p = snap.val();
      const el = document.getElementById('otherPresence');
      if(!p){ el.textContent = 'our little world'; el.classList.remove('online'); return; }
      if(p.online){
        el.textContent = 'online';
        el.classList.add('online');
      } else {
        el.classList.remove('online');
        if(p.lastSeen){
          el.textContent = 'last seen ' + new Date(p.lastSeen).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        } else {
          el.textContent = 'our little world';
        }
      }
    });
  }

  /* ---------------- TYPING INDICATOR ---------------- */
  let typingTimeout = null;
  function setupTyping(name){
    const other = name === 'Sahil' ? 'Ananya' : 'Sahil';
    const myTypingRef = db.ref('typing/' + name);
    db.ref('typing/' + other).on('value', function(snap){
      const banner = document.getElementById('typingBanner');
      if(snap.val()){
        banner.textContent = other + ' is typing\u2026';
        banner.classList.add('show');
      } else {
        banner.classList.remove('show');
      }
    });
    textInput.addEventListener('input', function(){
      myTypingRef.set(true);
      if(typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(function(){ myTypingRef.set(false); }, 2500);
    });
  }
  function clearTypingNow(){
    if(myName){ db.ref('typing/' + myName).set(false); }
    if(typingTimeout){ clearTimeout(typingTimeout); typingTimeout=null; }
  }

  /* ---------------- READ RECEIPTS (sent / delivered / seen) ---------------- */
  let otherLastRead = 0;
  let otherLastDelivered = 0;
  function setupReadReceipts(name){
    const other = name === 'Sahil' ? 'Ananya' : 'Sahil';
    db.ref('reads/' + other).on('value', function(snap){
      otherLastRead = snap.val() || 0;
      renderAll._lastSnap && renderAll(renderAll._lastSnap);
    });
    db.ref('delivered/' + other).on('value', function(snap){
      otherLastDelivered = snap.val() || 0;
      renderAll._lastSnap && renderAll(renderAll._lastSnap);
    });
    document.addEventListener('visibilitychange', function(){
      if(document.visibilityState === 'visible'){
        if(renderAll._lastLatestTs){ markAsRead(renderAll._lastLatestTs); }
        unreadBadgeCount = 0;
        clearAppBadge();
      }
    });
  }
  function markAsDelivered(latestTs){
    if(myName && latestTs){ db.ref('delivered/' + myName).set(latestTs); }
  }
  function markAsRead(latestTs){
    if(myName && latestTs && document.visibilityState === 'visible'){
      db.ref('reads/' + myName).set(latestTs);
    }
  }

  /* ---------------- NOTIFICATIONS + APP BADGE ---------------- */
  let seenMsgIds = null;
  let unreadBadgeCount = 0;

  function notifyNewMessage(m){
    if(document.visibilityState === 'visible') return;
    unreadBadgeCount++;
    setAppBadge(unreadBadgeCount);
    if(!('Notification' in window) || Notification.permission !== 'granted') return;
    let body;
    if(m.type === 'call'){ body = m.text; }
    else if(m.text){ body = m.text; }
    else if(m.fileType && m.fileType.startsWith('image/')){ body = 'sent a photo'; }
    else if(m.fileType && m.fileType.startsWith('video/')){ body = 'sent a video'; }
    else if(m.fileType && m.fileType.startsWith('audio/')){ body = 'sent an audio'; }
    else { body = 'sent something'; }
    try{
      const n = new Notification(m.sender || 'Saan', { body: body, icon: 'icon-192.png', tag: 'saan-msg' });
      n.onclick = function(){ window.focus(); n.close(); };
    }catch(e){}
  }
  function setAppBadge(count){
    if(navigator.setAppBadge){ navigator.setAppBadge(count).catch(function(){}); }
  }
  function clearAppBadge(){
    if(navigator.clearAppBadge){ navigator.clearAppBadge().catch(function(){}); }

  }

  function renderAll(snapshot){
    renderAll._lastSnap = snapshot;
    const val = snapshot.val();
    if(!val){
      msgsEl.innerHTML = '<div class="empty">no messages yet &mdash; say something sweet first &#10084;</div>';
      return;
    }
    const messages = Object.keys(val).map(function(k){ const m = val[k]; m._id = k; return m; }).sort(function(a,b){ return a.ts - b.ts; });

    /* ---- notifications for genuinely new incoming messages ---- */
    if(seenMsgIds === null){
      seenMsgIds = {};
      messages.forEach(function(m){ seenMsgIds[m._id] = true; });
    } else {
      messages.forEach(function(m){
        if(seenMsgIds[m._id]) return;
        seenMsgIds[m._id] = true;
        if(m.sender === myName) return;
        notifyNewMessage(m);
      });
    }

    const wasNearBottom = (msgsEl.scrollHeight - msgsEl.scrollTop - msgsEl.clientHeight) < 140;
    let html='';
    let latestMineTs = 0;
    let latestTs = 0;
    messages.forEach(function(m){
      if(m.ts > latestTs) latestTs = m.ts;
      if(m.type==='call'){
        html += '<div class="callmsg">&#9742; '+escapeHtml(m.text||'')+'</div>';
        return;
      }
      const mine = m.sender === myName;
      if(mine && m.ts > latestMineTs) latestMineTs = m.ts;
      const time = new Date(m.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
      html += '<div class="row '+(mine?'mine':'theirs')+'">';
      html += '<div class="bub-wrap">';
      if(!mine) html += '<div class="sender">'+escapeHtml(m.sender||'')+'</div>';
      html += '<div class="bub">';
      if(m.text) html += escapeHtml(m.text);
      html += fileBubbleHtml(m);
      html += '</div>';
      html += '<div class="time">'+time;
      if(mine){
        let cls, glyph;
        if(otherLastRead >= m.ts){ cls='seen'; glyph='&#10003;&#10003;'; }
        else if(otherLastDelivered >= m.ts){ cls='delivered'; glyph='&#10003;&#10003;'; }
        else { cls='sent'; glyph='&#10003;'; }
        html += ' <span class="ticks '+cls+'">'+glyph+'</span>';
      }
      html += '</div>';
      html += '</div></div>';
    });
    msgsEl.innerHTML = html;
    if(wasNearBottom){ msgsEl.scrollTop = msgsEl.scrollHeight; }
    if(latestTs){
      renderAll._lastLatestTs = latestTs;
      markAsDelivered(latestTs);
      markAsRead(latestTs);
    }
  }

  function startChat(name){
    msgsRef = db.ref('messages');
    msgsRef.off();
    msgsRef.on('value', renderAll, function(err){ console.error(err); });
    setupPresence(name);
    setupTyping(name);
    setupReadReceipts(name);
  }

  /* ---------------- CALLING (WebRTC + Firebase signaling) ---------------- */
  const ICE_SERVERS = { iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
  ]};

  const callRef = db.ref('call');
  let callListenerActive = false;
  let pc = null;
  let localStream = null;
  let currentCallType = null; // 'video' | 'audio'
  let callTimerInterval = null;
  let callStartTime = null;
  let iAmCaller = false;
  let processedCandidateKeys = {};
  let speakerOn = true;

  const incomingCallEl = document.getElementById('incomingCall');
  const inCallEl = document.getElementById('inCall');
  const remoteVideo = document.getElementById('remoteVideo');
  const localVideo = document.getElementById('localVideo');
  const voiceAvatarWrap = document.getElementById('voiceAvatarWrap');
  const voiceAvatar = document.getElementById('voiceAvatar');
  const callStatus = document.getElementById('callStatus');
  const callName = document.getElementById('callName');

  document.getElementById('voiceCallBtn').addEventListener('click', function(){ startOutgoingCall('audio'); });
  document.getElementById('videoCallBtn').addEventListener('click', function(){ startOutgoingCall('video'); });
  document.getElementById('acceptBtn').addEventListener('click', acceptIncomingCall);
  document.getElementById('declineBtn').addEventListener('click', function(){ endCall('declined'); });
  document.getElementById('endCallBtn').addEventListener('click', function(){ endCall('ended'); });
  document.getElementById('muteBtn').addEventListener('click', toggleMute);
  document.getElementById('camBtn').addEventListener('click', toggleCam);
  document.getElementById('speakerBtn').addEventListener('click', toggleSpeaker);
  document.getElementById('tapToHear').addEventListener('click', function(){
    remoteVideo.play().catch(function(){});
    this.classList.remove('show');
  });

  function otherPersonName(){ return myName === 'Sahil' ? 'Ananya' : 'Sahil'; }

  function startCallListeners(name){
    if(callListenerActive) return;
    callListenerActive = true;
    callRef.on('value', function(snap){
      const call = snap.val();
      if(!call){ return; }
      if(call.status === 'ringing' && call.callee === myName && !pc){
        showIncoming(call);
      } else if(call.status === 'accepted' && call.caller === myName && pc && !pc.currentRemoteDescription){
        handleAnswer(call);
      } else if(call.status === 'ended' || call.status === 'declined'){
        cleanupCallUI(call.status);
      }
      if((call.status === 'accepted' || call.status === 'ringing') && pc){
        const myRole = (call.caller === myName) ? 'caller' : 'callee';
        const candKey = myRole === 'caller' ? 'calleeCandidates' : 'callerCandidates';
        const cands = call[candKey];
        if(cands){
          Object.keys(cands).forEach(function(k){
            if(!processedCandidateKeys[k]){
              processedCandidateKeys[k] = true;
              pc.addIceCandidate(new RTCIceCandidate(cands[k])).catch(function(){});
            }
          });
        }
      }
    });
  }
  function stopCallListeners(){
    callRef.off();
    callListenerActive = false;
  }

  function showIncoming(call){
    document.getElementById('ringWho').textContent = call.caller;
    document.getElementById('ringAvatar').textContent = call.caller[0];
    document.getElementById('ringKind').textContent = (call.type==='video' ? 'video call' : 'voice call');
    incomingCallEl.classList.add('show');
    window._pendingCall = call;
  }

  async function getMedia(type){
    const constraints = type==='video' ? { video:{facingMode:'user'}, audio:true } : { video:false, audio:true };
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  function createPC(){
    const p = new RTCPeerConnection(ICE_SERVERS);
    p.ontrack = function(e){
      remoteVideo.srcObject = e.streams[0];
      const playPromise = remoteVideo.play();
      if(playPromise !== undefined){
        playPromise.catch(function(){
          document.getElementById('tapToHear').classList.add('show');
        });
      }
    };
    p.oniceconnectionstatechange = function(){
      updateCallStatusFromState(p.iceConnectionState);
    };
    p.onconnectionstatechange = function(){
      updateCallStatusFromState(p.connectionState);
    };
    return p;
  }

  function updateCallStatusFromState(state){
    if(state === 'connected' || state === 'completed'){
      if(!callStartTime){ callStatus.textContent = 'connected'; startTimer(); }
    } else if(state === 'checking'){
      callStatus.textContent = 'connecting\u2026';
    } else if(state === 'disconnected'){
      callStatus.textContent = 'reconnecting\u2026';
    } else if(state === 'failed'){
      callStatus.textContent = "couldn't connect \u2014 try again";
      setTimeout(function(){ endCall('ended'); }, 1800);
    }
  }

  async function startOutgoingCall(type){
    if(pc){ showToast('Already in a call.', 'error'); return; }
    const other = otherPersonName();
    processedCandidateKeys = {};
    try{
      localStream = await getMedia(type);
    }catch(e){
      showToast('Could not access camera/microphone. Please allow permission.', 'error');
      return;
    }
    currentCallType = type; iAmCaller = true;
    pc = createPC();
    localStream.getTracks().forEach(function(t){ pc.addTrack(t, localStream); });
    if(type==='video'){ localVideo.srcObject = localStream; localVideo.style.display='block'; voiceAvatarWrap.style.display='none'; }
    else { localVideo.style.display='none'; voiceAvatarWrap.style.display='flex'; voiceAvatar.textContent = other[0]; }

    pc.onicecandidate = function(e){
      if(e.candidate){ callRef.child('callerCandidates').push(e.candidate.toJSON()); }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await callRef.set({ caller: myName, callee: other, type: type, status:'ringing', offer:{ type:offer.type, sdp:offer.sdp } });

    showInCallUI(other, 'calling\u2026', type);
  }

  async function acceptIncomingCall(){
    const call = window._pendingCall;
    if(!call) return;
    processedCandidateKeys = {};
    incomingCallEl.classList.remove('show');
    try{
      localStream = await getMedia(call.type);
    }catch(e){
      showToast('Could not access camera/microphone. Please allow permission.', 'error');
      endCall('declined'); return;
    }
    currentCallType = call.type; iAmCaller = false;
    pc = createPC();
    localStream.getTracks().forEach(function(t){ pc.addTrack(t, localStream); });
    if(call.type==='video'){ localVideo.srcObject = localStream; localVideo.style.display='block'; voiceAvatarWrap.style.display='none'; }
    else { localVideo.style.display='none'; voiceAvatarWrap.style.display='flex'; voiceAvatar.textContent = call.caller[0]; }

    pc.onicecandidate = function(e){
      if(e.candidate){ callRef.child('calleeCandidates').push(e.candidate.toJSON()); }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(call.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await callRef.update({ status:'accepted', answer:{ type:answer.type, sdp:answer.sdp } });

    showInCallUI(call.caller, 'connecting\u2026', call.type);
  }

  async function handleAnswer(call){
    if(!call.answer) return;
    await pc.setRemoteDescription(new RTCSessionDescription(call.answer));
    callStatus.textContent = 'connecting\u2026';
  }

  function showInCallUI(withWhom, statusText, type){
    inCallEl.classList.remove('minimized');
    inCallEl.classList.add('show');
    callName.textContent = withWhom;
    callStatus.textContent = statusText;
    document.getElementById('callTimer').textContent = '';
    document.getElementById('callPipLabel').textContent = withWhom;
    if(type==='audio'){ remoteVideo.style.display='none'; } else { remoteVideo.style.display='block'; }
  }

  function startTimer(){
    callStartTime = Date.now();
    if(callTimerInterval) clearInterval(callTimerInterval);
    callTimerInterval = setInterval(function(){
      const secs = Math.floor((Date.now()-callStartTime)/1000);
      const mm = String(Math.floor(secs/60)).padStart(2,'0');
      const ss = String(secs%60).padStart(2,'0');
      const t = document.getElementById('callTimer');
      if(t) t.textContent = mm+':'+ss;
      const pt = document.getElementById('callPipTimer');
      if(pt) pt.textContent = mm+':'+ss;
    }, 1000);
  }

  document.getElementById('minimizeCallBtn').addEventListener('click', function(){
    inCallEl.classList.add('minimized');
  });
  document.getElementById('callPipExpandBtn').addEventListener('click', function(){
    inCallEl.classList.remove('minimized');
  });

  const callPipBtn = document.getElementById('callPipBtn');
  if(!('pictureInPictureEnabled' in document)){
    callPipBtn.style.display = 'none';
  } else {
    callPipBtn.addEventListener('click', async function(){
      try{
        if(document.pictureInPictureElement){
          await document.exitPictureInPicture();
        } else if(remoteVideo.readyState >= 1){
          await remoteVideo.requestPictureInPicture();
        } else {
          showToast('Video not ready for picture-in-picture yet.', 'error');
        }
      }catch(e){
        showToast('Picture-in-picture is not available for this call right now.', 'error');
      }
    });
  }

  function toggleMute(){
    if(!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if(!track) return;
    track.enabled = !track.enabled;
    document.getElementById('muteBtn').classList.toggle('active', !track.enabled);
  }
  function toggleCam(){
    if(!localStream) return;
    const track = localStream.getVideoTracks()[0];
    if(!track) return;
    track.enabled = !track.enabled;
    document.getElementById('camBtn').classList.toggle('active', !track.enabled);
  }
  function toggleSpeaker(){
    speakerOn = !speakerOn;
    remoteVideo.volume = speakerOn ? 1 : 1;
    document.getElementById('speakerBtn').classList.toggle('active', speakerOn);
  }

  function endCall(reason){
    callRef.update({ status: reason || 'ended' }).then(function(){
      setTimeout(function(){ callRef.remove(); }, 800);
    });
    if(msgsRef && currentCallType){
      const kind = currentCallType==='video' ? 'Video' : 'Voice';
      let logText;
      if(callStartTime){
        const secs = Math.floor((Date.now()-callStartTime)/1000);
        const mm = String(Math.floor(secs/60)).padStart(2,'0');
        const ss = String(secs%60).padStart(2,'0');
        logText = kind+' call \u2014 '+mm+':'+ss;
      } else if(reason==='declined'){
        logText = kind+' call \u2014 declined';
      } else if(iAmCaller){
        logText = kind+' call \u2014 no answer';
      } else {
        logText = kind+' call \u2014 missed';
      }
      msgsRef.push({ type:'call', text: logText, ts: Date.now() });
    }
    cleanupCallUI(reason);
  }

  function cleanupCallUI(){
    incomingCallEl.classList.remove('show');
    inCallEl.classList.remove('show');
    inCallEl.classList.remove('minimized');
    document.getElementById('tapToHear').classList.remove('show');
    if(callTimerInterval){ clearInterval(callTimerInterval); callTimerInterval=null; }
    callStartTime = null;
    currentCallType = null;
    if(pc){ pc.close(); pc = null; }
    if(localStream){ localStream.getTracks().forEach(function(t){ t.stop(); }); localStream=null; }
    remoteVideo.srcObject = null;
    localVideo.srcObject = null;
    document.getElementById('muteBtn').classList.remove('active');
    document.getElementById('camBtn').classList.remove('active');
    window._pendingCall = null;
  }

  /* Best-effort: end call if the page is actually being closed (not just minimized) */
  window.addEventListener('pagehide', function(){
    if(pc){
      try{ callRef.update({ status:'ended' }); }catch(e){}
    }
  });
})();

if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}
