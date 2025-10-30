
import { documents } from '../data/policies';

export interface DocumentSearchResult {
  title: string;
  content: string;
}

/**
 * Calculates the Levenshtein distance between two strings.
 * This is used for fuzzy matching to account for typos.
 * The implementation is optimized for memory.
 * @param s1 The first string.
 * @param s2 The second string.
 * @returns The number of edits required to change s1 into s2.
 */
const levenshtein = (s1: string, s2: string): number => {
    if (!s1.length) return s2.length;
    if (!s2.length) return s1.length;

    // Swap to save memory O(min(a,b)) instead of O(a)
    if (s1.length > s2.length) {
        [s1, s2] = [s2, s1];
    }
    
    const s1Len = s1.length;
    const s2Len = s2.length;
    
    let previousRow = Array.from({ length: s1Len + 1 }, (_, i) => i);
    
    for (let i = 1; i <= s2Len; i++) {
        let currentRow = [i];
        for (let j = 1; j <= s1Len; j++) {
            const insertions = previousRow[j] + 1;
            const deletions = currentRow[j - 1] + 1;
            const substitutions = previousRow[j - 1] + (s1[j - 1] === s2[i - 1] ? 0 : 1);
            currentRow.push(Math.min(insertions, deletions, substitutions));
        }
        previousRow = currentRow;
    }
    
    return previousRow[s1Len];
};

// A map of synonyms to expand user queries for more relevant results.
const synonymMap: { [key: string]: string[] } = {
  leave: ['absence', 'time off', 'vacation', 'break'],
  parental: ['maternity', 'paternity', 'family', 'child'],
  wfh: ['remote', 'work from home', 'telecommute', 'home office'],
  security: ['safety', 'protection', 'secure', 'privacy'],
  policy: ['guideline', 'rule', 'procedure', 'protocol'],
  expense: ['reimbursement', 'cost', 'spending', 'charge'],
  conduct: ['behavior', 'ethics', 'professionalism'],
  harassment: ['bullying', 'discrimination', 'abuse'],
  it: ['information technology', 'tech support'],
  hr: ['human resources'],
};


/**
 * Searches company documents using query expansion and fuzzy matching.
 * @param query The user's search query.
 * @returns An array of the most relevant document search results.
 */
export const searchDocuments = (query: string): DocumentSearchResult[] => {
  console.log(`Searching for: "${query}"`);
  
  // 1. Preprocessing and Synonym Expansion
  const lowerCaseQuery = query.toLowerCase();
  const queryTerms = lowerCaseQuery.split(/\s+/).filter(term => term.length > 2);
  
  const expandedTerms = new Set<string>(queryTerms);
  queryTerms.forEach(term => {
    for (const key in synonymMap) {
      const synonyms = synonymMap[key];
      if (key === term || synonyms.includes(term)) {
        expandedTerms.add(key);
        synonyms.forEach(syn => expandedTerms.add(syn));
      }
    }
  });

  const finalSearchTerms = Array.from(expandedTerms);
  console.log('Expanded search terms:', finalSearchTerms);

  // 2. Scoring with Fuzzy Matching
  const scoredDocs = documents.map(doc => {
    const titleTokens = doc.title.toLowerCase().split(/\s+/);
    const contentTokens = doc.content.toLowerCase().split(/\s+/);
    let score = 0;

    finalSearchTerms.forEach(term => {
      const threshold = term.length > 3 ? 1 : 0; // Allow 1 typo for words > 3 chars
      
      // Check title with fuzzy matching
      titleTokens.forEach(token => {
        const cleanToken = token.replace(/[.,()]/g, '');
        if (levenshtein(term, cleanToken) <= threshold) {
          score += 5; // Higher weight for title matches
        }
      });
      
      // Check content with fuzzy matching
      contentTokens.forEach(token => {
        const cleanToken = token.replace(/[.,()]/g, '');
        if (levenshtein(term, cleanToken) <= threshold) {
          score += 1;
        }
      });
    });
    
    return { ...doc, score };
  });

  // 3. Ranking and Returning Results
  const relevantDocs = scoredDocs
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score);

  const searchResults = relevantDocs.slice(0, 2).map(({ title, content }) => ({ title, content }));
  console.log('Found results:', searchResults.map(r => r.title));
  return searchResults;
};
