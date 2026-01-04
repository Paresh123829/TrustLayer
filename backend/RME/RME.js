import { pipeline, cos_sim } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

let extractor = null;
let restrictedEmbeddings = [];
let isRestrictionEnabled = true;
let threshold = 0.65;

async function initRME() {
  try {
    const status = document.getElementById('status');
    if (status) {
      status.textContent = 'Loading AI model (first time may take 1–2 minutes)...';
    }

    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
      progress_callback: (data) => {
        if (data.status === 'downloading' && status) {
          status.textContent = `Downloading model... ${Math.round(data.progress)}%`;
        }
      }
    });

    // CORRECT PATH
    const response = await fetch('/backend/json_files/reply.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch reply.json: ${response.status} ${response.statusText}`);
    }

    const restrictedQueries = await response.json();

    const outputs = await extractor(restrictedQueries, {
      pooling: 'mean',
      normalize: true
    });

    restrictedEmbeddings = outputs.tolist();

    if (status) {
      status.textContent = 'Model ready!';
      setTimeout(() => {
        if (status) status.textContent = '';
      }, 3000);
    }

    console.log('RME initialized successfully with', restrictedEmbeddings.length, 'restricted query embeddings');
  } catch (err) {
    console.error('Failed to initialize RME:', err);
    const status = document.getElementById('status');
    if (status) {
      status.textContent = 'Failed to load model';
      status.style.color = '#e74c3c';
    }
  }
}

async function isRestricted(query) {
  if (!extractor || restrictedEmbeddings.length === 0) {
    console.warn('RME not ready yet');
    return false;
  }

  try {
    const output = await extractor([query], {
      pooling: 'mean',
      normalize: true
    });
    const queryEmb = output.tolist()[0];

    let maxSimilarity = 0;
    for (const emb of restrictedEmbeddings) {
      const sim = cos_sim(queryEmb, emb);
      if (sim > maxSimilarity) {
        maxSimilarity = sim;
        if (sim >= threshold) {
          break;
        }
      }
    }

    console.log(`Query: "${query}" → Max similarity: ${maxSimilarity.toFixed(3)} (threshold: ${threshold})`);
    return maxSimilarity >= threshold;
  } catch (error) {
    console.error('Error during restriction check:', error);
    return false;
  }
}

window.checkQuery = async function(query) {
  const flag = document.getElementById('flag');
  if (!flag) return { restricted: false };

  if (!isRestrictionEnabled) {
    flag.style.backgroundColor = '#27ae60';
    return { restricted: false };
  }

  try {
    const restricted = await isRestricted(query.trim());

    if (restricted) {
      flag.style.backgroundColor = '#e74c3c';
    } else {
      flag.style.backgroundColor = '#27ae60';
    }

    return { restricted };
  } catch (error) {
    console.error('Error checking query:', error);
    flag.style.backgroundColor = '#f39c12';
    return { restricted: false };
  }
};

window.toggleRestriction = function() {
  isRestrictionEnabled = !isRestrictionEnabled;
  const btn = document.getElementById('toggleBtn');
  const flag = document.getElementById('flag');

  if (btn) {
    btn.textContent = isRestrictionEnabled ? 'Restriction: ON' : 'Restriction: OFF';
    btn.style.backgroundColor = isRestrictionEnabled ? '#27ae60' : '#95a5a6';
  }

  if (flag) {
    flag.style.backgroundColor = '#95a5a6';
  }
};

initRME();