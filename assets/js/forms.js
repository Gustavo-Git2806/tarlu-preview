/* Tarlu — bind each on-page form to its Supabase table.
   Runs on every public page; only activates forms it finds.
   Table names must match _supabase/schema.sql. */
(function () {
    'use strict';
    if (!window.TarluSupabase) return;   // supabase.js failed to load

    // Enquiry form uses Google Forms `entry.NNNNNN` field names (kept for
    // fallback if you ever revert to Google Forms). Map them to Supabase columns.
    var ENQUIRY_MAP = {
        'entry.946940642':  'company',
        'entry.275625842':  'country',
        'entry.714062286':  'full_name',
        'entry.1912414312': 'email',
        'entry.965626338':  'phone',
        'entry.917499852':  'services',
        'entry.1751009793': 'region',
        'entry.2112811084': 'product_type',
        'entry.361416542':  'skus',
        'entry.1860664801': 'hazardous',
        'entry.911774484':  'barcoded',
        'entry.1687744543': 'tracking',
        'entry.1697253059': 'weight_brackets',
        'entry.1565875676': 'length_brackets',
        'entry.273201243':  'storage_initial',
        'entry.1085825481': 'storage_peak',
        'entry.251451304':  'orders_per_week',
        'entry.1317071218': 'units_per_order',
        'entry.1848592817': 'add_services',
        'entry.464589457':  'go_live_date',
        'entry.222411932':  'notes',
        'entry.1227438091': 'hear_source'
    };
    // Fields that should always be arrays (checkbox groups)
    var ARRAY_FIELDS = ['services','region','tracking','weight_brackets','length_brackets','add_services','topics'];

    function remap(payload, map) {
        var out = {};
        Object.keys(payload).forEach(function (k) {
            var target = map[k] || k;
            // Drop the ".other_option_response" suffix Google Forms appends
            if (target.indexOf('.other_option_response') > -1) return;
            var val = payload[k];
            if (ARRAY_FIELDS.indexOf(target) > -1 && !Array.isArray(val)) val = [val];
            out[target] = val;
        });
        return out;
    }

    var bindings = [
        // [form selector, table name, success message, optional field-name map]
        ['#enquiry-form',                     'enquiries',       'Thanks — we\'ll come back within one working day.', ENQUIRY_MAP],
        ['form[data-form="complaints"]',      'complaints',      'Complaint received. Response within 10 working days.', null],
        ['form[data-form="agency-request"]',  'agency_requests', 'Request submitted for approval.', null],
        ['form[data-form="mailing-list"]',    'mailing_list',    'You\'re on the list. Welcome.', null],
        ['form[data-form="contact"]',         'contact_messages','Message sent. We\'ll reply within one working day.', null]
    ];

    bindings.forEach(function (b) {
        var form = document.querySelector(b[0]);
        if (!form) return;
        var selector = b[0], table = b[1], msg = b[2], map = b[3];
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            var btn = form.querySelector('button[type="submit"]');
            var note = form.querySelector('.form-note');
            var original = btn ? btn.textContent : '';
            if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

            var payload = window.TarluSupabase.serialiseForm(form);
            if (map) payload = remap(payload, map);
            // Normalise array fields for schemas that expect them
            ARRAY_FIELDS.forEach(function (k) {
                if (k in payload && !Array.isArray(payload[k])) payload[k] = [payload[k]];
            });

            var result = await window.TarluSupabase.submitForm(table, payload);
            if (result.ok) {
                if (btn) btn.textContent = result.preview ? 'Preview only · not stored' : '✓ Sent';
                if (note) note.textContent = result.preview ? 'Preview mode — connect Supabase to enable real submissions.' : msg;
                if (!result.preview) form.reset();
                form.classList.add('form-submitted');
            } else {
                if (btn) { btn.disabled = false; btn.textContent = original; }
                if (note) note.textContent = 'Error: ' + result.error;
            }
        });
    });
})();
