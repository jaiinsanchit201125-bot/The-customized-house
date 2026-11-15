/* The Customized House - UPI checkout
   Customer fills delivery details, pays the exact amount by UPI, then sends the
   order with the UPI transaction ID to TCH on WhatsApp for confirmation. */
window.TCHUpi = (function(){
  const UPI_ID = '8431573282@fam';
  const PAYEE = 'The Customized House';
  const WA_NUM = '918431573282';
  const money = n => '₹' + n.toLocaleString('en-IN');
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  let order = null, onDone = null;

  const el = document.createElement('div');
  el.className = 'upi'; el.id = 'upi'; el.setAttribute('aria-hidden','true');
  el.innerHTML = `
  <div class="upi-card" role="dialog" aria-modal="true" aria-labelledby="upiTitle">
    <button class="upi-x" id="upiClose" aria-label="Close">×</button>
    <div class="upi-steps"><span data-s="1" class="on">1. Delivery</span><span data-s="2">2. Pay by UPI</span><span data-s="3">3. Confirm</span></div>

    <section data-step="1">
      <h3 id="upiTitle">Delivery details</h3>
      <div class="upi-sum" id="upiSum1"></div>
      <form id="upiForm" novalidate>
        <div class="f2"><label>Full name<input name="name" required autocomplete="name"></label>
        <label>WhatsApp number<input name="phone" required inputmode="numeric" maxlength="10" placeholder="10-digit number" autocomplete="tel-national"></label></div>
        <label>Email (for order updates)<input name="email" type="email" autocomplete="email" placeholder="optional"></label>
        <label>Address<textarea name="address" required rows="2" autocomplete="street-address" placeholder="House no, street, area, landmark"></textarea></label>
        <div class="f3"><label>City<input name="city" required autocomplete="address-level2"></label>
        <label>State<input name="state" required autocomplete="address-level1"></label>
        <label>Pincode<input name="pin" required inputmode="numeric" maxlength="6" autocomplete="postal-code"></label></div>
        <p class="upi-err" id="upiErr1"></p>
        <button class="btn btn-primary upi-go" type="submit">Continue to payment</button>
        <small class="upi-fine">Free delivery across India · Prices include GST</small>
      </form>
    </section>

    <section data-step="2" hidden>
      <h3>Pay <span id="upiAmt"></span> by UPI</h3>
      <p class="upi-ref">Order <b id="upiRef"></b></p>
      <a class="btn btn-primary upi-go" id="upiApp" href="#">Pay with any UPI app</a>
      <div class="upi-qr"><img src="assets/upi-qr.png" alt="UPI QR code for The Customized House" width="190" height="190">
        <div><p>Or scan with GPay, PhonePe, Paytm or any UPI app, and enter <b id="upiAmt2"></b></p>
        <p class="upi-id">UPI ID: <b>${UPI_ID}</b> <button type="button" id="upiCopy">Copy</button></p></div></div>
      <label>UPI transaction ID / UTR <span class="opt">(12 digits, shown after payment)</span><input id="upiUtr" inputmode="numeric" maxlength="22" placeholder="e.g. 431512345678"></label>
      <p class="upi-err" id="upiErr2"></p>
      <button class="btn btn-wa upi-go" id="upiPaid">I have paid, confirm my order</button>
      <button class="upi-back" type="button" id="upiBack">← Edit delivery details</button>
    </section>

    <section data-step="3" hidden>
      <h3>Almost done!</h3>
      <p>Send the WhatsApp message that just opened so we can match your payment. We will confirm your order and start printing.</p>
      <p>If WhatsApp did not open, <a href="#" id="upiWaAgain">tap here</a>.</p>
      <button class="btn btn-primary upi-go" id="upiFinish">Done</button>
    </section>
  </div>`;
  document.body.appendChild(el);
  const $ = s => el.querySelector(s);

  function step(n){
    el.querySelectorAll('section[data-step]').forEach(s => s.hidden = s.dataset.step != n);
    el.querySelectorAll('.upi-steps span').forEach(s => s.classList.toggle('on', +s.dataset.s <= n));
    $('.upi-card').scrollTop = 0;
  }
  function summary(){
    return order.lines.map(l=>`<div><span>${l.name} · ${l.size} × ${l.qty}</span><b>${money(l.price*l.qty)}</b></div>`).join('')
      + `<div class="t"><span>Total (free delivery)</span><b>${money(order.total)}</b></div>`;
  }
  function ref(){
    const d = new Date(), p = n => String(n).padStart(2,'0');
    return 'TCH' + String(d.getFullYear()).slice(2) + p(d.getMonth()+1) + p(d.getDate()) + '-' + Math.random().toString(36).slice(2,6).toUpperCase();
  }
  function saved(){ try{ return JSON.parse(localStorage.getItem('tch_ship')||'{}'); }catch(e){ return {}; } }

  function open(lines, done){
    order = { lines, total: lines.reduce((a,l)=>a+l.price*l.qty,0), ref: ref() };
    onDone = done;
    window.tchTrack&&tchTrack('InitiateCheckout',{value:order.total,currency:'INR',num_items:lines.reduce((a,l)=>a+l.qty,0)});
    $('#upiSum1').innerHTML = summary();
    const f = $('#upiForm'), s = saved();
    Object.keys(s).forEach(k => { if(f.elements[k]) f.elements[k].value = s[k]; });
    $('#upiErr1').textContent = ''; $('#upiErr2').textContent = ''; $('#upiUtr').value = '';
    step(1); el.classList.add('on'); el.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  }
  function close(){ el.classList.remove('on'); el.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

  $('#upiClose').addEventListener('click', close);
  el.addEventListener('click', e => { if(e.target === el) close(); });
  addEventListener('keydown', e => { if(e.key==='Escape' && el.classList.contains('on')) close(); });

  $('#upiForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, v = Object.fromEntries(new FormData(f).entries());
    Object.keys(v).forEach(k => v[k] = v[k].trim());
    let err = '';
    if(!v.name || !v.address || !v.city || !v.state) err = 'Please fill in your name and full address.';
    else if(!/^[6-9]\d{9}$/.test(v.phone)) err = 'Please enter a valid 10-digit WhatsApp number.';
    else if(!/^\d{6}$/.test(v.pin)) err = 'Please enter a valid 6-digit pincode.';
    else if(v.email && !/^\S+@\S+\.\S+$/.test(v.email)) err = 'Please check your email address.';
    $('#upiErr1').textContent = err; if(err) return;
    order.ship = v; try{ localStorage.setItem('tch_ship', JSON.stringify(v)); }catch(e){}
    $('#upiAmt').textContent = money(order.total); $('#upiAmt2').textContent = money(order.total);
    $('#upiRef').textContent = order.ref;
    const link = 'upi://pay?pa=' + encodeURIComponent(UPI_ID) + '&pn=' + encodeURIComponent(PAYEE) + '&am=' + order.total.toFixed(2) + '&cu=INR&tn=' + encodeURIComponent('Order ' + order.ref);
    $('#upiApp').href = link; $('#upiApp').style.display = isMobile ? '' : 'none';
    step(2);
  });
  $('#upiBack').addEventListener('click', () => step(1));
  $('#upiCopy').addEventListener('click', () => {
    const b = $('#upiCopy');
    (navigator.clipboard ? navigator.clipboard.writeText(UPI_ID) : Promise.reject()).then(()=>{ b.textContent='Copied'; setTimeout(()=>b.textContent='Copy',1500); }).catch(()=>{ b.textContent=UPI_ID; });
  });

  function waText(){
    const s = order.ship, utr = $('#upiUtr').value.trim();
    return [
      `Hi The Customized House, I have placed an order and paid by UPI.`,
      ``, `Order: ${order.ref}`,
      ...order.lines.map((l,i)=>`${i+1}. ${l.name} - ${l.colour} - Size ${l.size} x ${l.qty} = ${money(l.price*l.qty)}`),
      `Total paid: ${money(order.total)}`,
      `UPI transaction ID: ${utr || '(sharing screenshot)'}`,
      ``, `Deliver to:`, s.name, s.address, `${s.city}, ${s.state} - ${s.pin}`, `Phone: ${s.phone}`, s.email ? `Email: ${s.email}` : ''
    ].filter((x,i,a)=>x!=='' || a[i-1]!=='').join('\n');
  }
  function sendWa(){ window.open('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(waText()), '_blank'); }
  $('#upiPaid').addEventListener('click', () => {
    const utr = $('#upiUtr').value.trim();
    if(utr && !/^\d{12}$/.test(utr)){ $('#upiErr2').textContent = 'The UPI transaction ID is usually 12 digits. Check it, or leave it empty and send a screenshot on WhatsApp.'; return; }
    $('#upiErr2').textContent = '';
    window.tchTrack&&tchTrack('Purchase',{value:order.total,currency:'INR',content_ids:order.lines.map(l=>l.id||l.name),content_type:'product'});
    sendWa(); step(3); if(onDone) onDone(order);
  });
  $('#upiWaAgain').addEventListener('click', e => { e.preventDefault(); sendWa(); });
  $('#upiFinish').addEventListener('click', close);

  return { open, upiId: UPI_ID };
})();
