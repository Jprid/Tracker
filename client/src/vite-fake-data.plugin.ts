import type { Plugin } from 'vite';
import { generateFakeMedicines, generateFakeEntries, generateDayTotals, FAKE_DATA_CONFIG } from './utils/fakeData.ts';

export function fakeDataPlugin(): Plugin {
  let fakeMedicines: ReturnType<typeof generateFakeMedicines> = [];
  let fakeEntries: ReturnType<typeof generateFakeEntries> = [];
  let fakeDayTotals: ReturnType<typeof generateDayTotals> = [];

  return {
    name: 'fake-data',
    configureServer(server) {
      // Check environment variables and mode
      const isScreenshotMode = server.config.mode === 'screenshot';
      
      // In screenshot mode, force the fake data to be enabled regardless of env vars
      const useFakeData = isScreenshotMode || process.env.VITE_USE_FAKE_DATA === 'true';
      
      console.log('🔍 Fake Data Plugin: mode =', server.config.mode);
      console.log('🔍 Fake Data Plugin: VITE_USE_FAKE_DATA =', process.env.VITE_USE_FAKE_DATA);
      console.log('🔍 Fake Data Plugin: VITE_API_BASE_URL =', process.env.VITE_API_BASE_URL);
      console.log('🔍 Fake Data Plugin: All VITE_ env vars =', Object.keys(process.env).filter(k => k.startsWith('VITE_')));
      console.log('🔍 Fake Data Plugin: useFakeData =', useFakeData);
      
      if (!useFakeData) {
        console.log('⚠️ Fake Data Plugin: Not enabled, skipping API interception');
        return;
      }

      console.log('🎭 Fake Data Plugin: Intercepting API calls');

      // Generate fake data once when server starts
      fakeMedicines = generateFakeMedicines(FAKE_DATA_CONFIG);
      fakeEntries = generateFakeEntries(FAKE_DATA_CONFIG);
      fakeDayTotals = generateDayTotals(fakeMedicines);
      
      console.log('📊 Generated fake data:');
      console.log(`  - ${fakeMedicines.length} medicine entries`);
      console.log(`  - ${fakeEntries.length} regular entries`);
      console.log(`  - ${fakeDayTotals.length} day totals`);

      // Intercept all requests that contain API paths
      server.middlewares.use((req, res, next) => {
        const method = req.method;
        const url = req.url;
        
        console.log(`🔍 All requests: ${method} ${url}`);
        
        // Only intercept API-related requests
        if (url?.includes('/auth/') || url?.includes('/medicine') || url?.includes('/entries') || url?.startsWith('/api/')) {
          console.log(`🔄 Intercepted: ${method} ${url}`);
          
          // Normalize the URL by removing any undefined parts and /api prefix
          let normalizedUrl = url;
          if (url.includes('/undefined/')) {
            normalizedUrl = url.replace('/undefined', '');
          }
          if (url.startsWith('/api/')) {
            normalizedUrl = url.replace('/api', '');
          }
          
          console.log(`🔧 Normalized URL: ${normalizedUrl}`);
          
          // Set CORS headers
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

          if (method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          // Handle auth endpoints
          if (normalizedUrl === '/auth/init' && method === 'POST') {
            console.log('✅ Handling auth/init');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Auth initialized',
              accessToken: 'fake-access-token'
            }));
            return;
          }

          if (normalizedUrl === '/auth/refresh' && method === 'POST') {
            console.log('✅ Handling auth/refresh');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ 
              success: true,
              accessToken: 'fake-refreshed-access-token'
            }));
            return;
          }

          // Handle medicine endpoints
          if (normalizedUrl === '/medicine' && method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ entries: fakeMedicines }));
            return;
          }

          // Handle date-filtered medicine requests with path parameter (/medicine/9-23-2025 or /medicine/2025-09-23)
          if (normalizedUrl?.startsWith('/medicine/') && method === 'GET' && !normalizedUrl.includes('/pivot')) {
            const datePart = normalizedUrl.split('/medicine/')[1];
            console.log('🗓️ Medicine date filter request:', datePart);
            
            // Check if it's a date in either M-DD-YYYY or YYYY-MM-DD format
            if (datePart && (/^\d{1,2}-\d{1,2}-\d{4}$/.test(datePart) || /^\d{4}-\d{2}-\d{2}$/.test(datePart))) {
              let filterDate: Date;
              
              if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(datePart)) {
                // M-DD-YYYY format, convert to MM/DD/YYYY for Date constructor
                const [month, day, year] = datePart.split('-');
                filterDate = new Date(`${month}/${day}/${year}`);
              } else {
                // YYYY-MM-DD format
                filterDate = new Date(datePart.replace(/-/g, '/'));
              }
              
              console.log('🗓️ Filtering medicines for date:', filterDate.toDateString());
              const targetDateString = filterDate.toDateString();
              const filtered = fakeMedicines.filter(entry => 
                new Date(entry.created_at).toDateString() === targetDateString
              );
              
              console.log('💊 Found', filtered.length, 'medicine entries for', targetDateString);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ entries: filtered }));
              return;
            }
          }

          if (normalizedUrl?.startsWith('/medicine/') && normalizedUrl.endsWith('/pivot') && method === 'GET') {
            const substanceName = normalizedUrl.split('/')[2];
            console.log('🔄 Pivot request for substance:', substanceName);
            console.log('📊 Available substances in fake data:', [...new Set(fakeMedicines.map(m => m.name))]);
            
            const filtered = fakeMedicines.filter(m => 
              m.name.toLowerCase() === substanceName.toLowerCase()
            );
            console.log('🎯 Filtered medicines for', substanceName, ':', filtered.length, 'entries');
            
            const totals = generateDayTotals(filtered);
            console.log('📈 Generated day totals:', totals);
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ entries: totals }));
            return;
          }

          if (normalizedUrl === '/medicine/day-totals' && method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ entries: fakeDayTotals }));
            return;
          }

          if (normalizedUrl === '/medicine/substances' && method === 'GET') {
            console.log('✅ Handling medicine/substances');
            const uniqueSubstances = [...new Set(fakeMedicines.map(m => m.name))];
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: true,
              substances: uniqueSubstances 
            }));
            return;
          }

          // Handle entry endpoints
          if (normalizedUrl === '/entries' && method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ entries: fakeEntries }));
            return;
          }

          // Handle date-filtered entry requests with path parameter (/entries/2025-09-23)
          if (normalizedUrl?.includes('entries') && method === 'GET') {
            const datePart = normalizedUrl.split('/entries/')[1];
            // Check if it's a date (YYYY-MM-DD format)
            console.log('🔍 Date part for entries filter:', datePart);
            if (datePart) {
              const filterDate = new Date(datePart.replace(/-/g, '/')).toDateString();
              const filtered = fakeEntries.filter(entry => 
                new Date(entry.created_at).toDateString() === filterDate
              );
              
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ entries: filtered }));
              return;
            }
          }

          // Handle date-filtered requests
          if (normalizedUrl?.startsWith('/medicine?date=') && method === 'GET') {
            const dateParam = normalizedUrl.split('date=')[1];
            const filterDate = new Date(dateParam.replace(/-/g, '/')).toDateString();
            const filtered = fakeMedicines.filter(entry => 
              new Date(entry.created_at).toDateString() === filterDate
            );
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ entries: filtered }));
            return;
          }

          if (normalizedUrl?.startsWith('/entries?date=') && method === 'GET') {
            const dateParam = normalizedUrl.split('date=')[1];
            const filterDate = new Date(dateParam.replace(/-/g, '/')).toDateString();
            const filtered = fakeEntries.filter(entry => 
              new Date(entry.created_at).toDateString() === filterDate
            );
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ entries: filtered }));
            return;
          }

          // Handle POST requests (adding new entries)
          if (normalizedUrl === '/medicine' && method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => {
              body += chunk.toString();
            });
            
            req.on('end', () => {
              try {
                const newEntry = JSON.parse(body);
                const entry = {
                  ...newEntry,
                  id: fakeMedicines.length + 1,
                  created_at: new Date().toISOString(),
                  displayTime: new Date().toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })
                };
                
                fakeMedicines.unshift(entry);
                fakeDayTotals = generateDayTotals(fakeMedicines);
                
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 201;
                res.end(JSON.stringify(entry));
              } catch {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }

          if (normalizedUrl === '/entries' && method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => {
              body += chunk.toString();
            });
            
            req.on('end', () => {
              try {
                const newEntry = JSON.parse(body);
                const entry = {
                  ...newEntry,
                  id: fakeEntries.length + 1,
                  created_at: new Date().toISOString(),
                  displayTime: new Date().toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })
                };
                
                fakeEntries.unshift(entry);
                
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 201;
                res.end(JSON.stringify(entry));
              } catch {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }

          // Handle PUT requests (updating entries)
          if (normalizedUrl?.startsWith('/medicine/') && method === 'PUT') {
            const id = parseInt(normalizedUrl.split('/')[2]);
            let body = '';
            
            req.on('data', (chunk: any) => {
              body += chunk.toString();
            });
            
            req.on('end', () => {
              try {
                const updatedEntry = JSON.parse(body);
                const index = fakeMedicines.findIndex(m => m.id === id);
                
                if (index !== -1) {
                  fakeMedicines[index] = { ...fakeMedicines[index], ...updatedEntry };
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(fakeMedicines[index]));
                } else {
                  res.statusCode = 404;
                  res.end(JSON.stringify({ error: 'Entry not found' }));
                }
              } catch {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }

          // Handle DELETE requests
          if (normalizedUrl?.startsWith('/medicine/') && method === 'DELETE') {
            const id = parseInt(normalizedUrl.split('/')[2]);
            const index = fakeMedicines.findIndex(m => m.id === id);
            
            if (index !== -1) {
              fakeMedicines.splice(index, 1);
              fakeDayTotals = generateDayTotals(fakeMedicines);
              res.statusCode = 204;
              res.end();
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Entry not found' }));
            }
            return;
          }

          // If we get here, the request wasn't handled
          console.log(`⚠️ Unhandled API request: ${method} ${normalizedUrl}`);
        }
        
        next();
      });
    },
  };
}
