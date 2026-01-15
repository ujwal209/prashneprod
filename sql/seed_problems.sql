-- Create the problems table
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
    description TEXT NOT NULL,
    starter_code JSONB NOT NULL DEFAULT '{}'::jsonb,
    test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
    acceptance_rate REAL DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (authenticated users)
CREATE POLICY "Allow public read access" 
ON public.problems 
FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Allow read access for service role (admin)
CREATE POLICY "Allow admin full access" 
ON public.problems 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);


-- Seed Data
INSERT INTO public.problems (slug, title, difficulty, acceptance_rate, description, starter_code)
VALUES 
(
    'two-sum',
    'Two Sum',
    'Easy',
    48.5,
    '# Two Sum

Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to `target`*.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.

**Example 1:**
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```
',
    '{"python": "def twoSum(nums: List[int], target: int) -> List[int]:\n    # Your code here\n    pass", "javascript": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};"}'::jsonb
),
(
    'lru-cache',
    'LRU Cache',
    'Medium',
    34.2,
    '# LRU Cache

Design a data structure that follows the constraints of a **[Least Recently Used (LRU) cache](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU)**.

Implement the `LRUCache` class:
* `LRUCache(int capacity)` Initialize the LRU cache with positive size `capacity`.
* `int get(int key)` Return the value of the `key` if the key exists, otherwise return `-1`.
* `void put(int key, int value)` Update the value of the `key` if the `key` exists. Otherwise, add the `key-value` pair to the cache. If the number of keys exceeds the `capacity` from this operation, **evict** the least recently used key.

The functions `get` and `put` must each run in `O(1)` average time complexity.
',
    '{"python": "class LRUCache:\n\n    def __init__(self, capacity: int):\n        pass\n\n    def get(self, key: int) -> int:\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        pass", "javascript": "/**\n * @param {number} capacity\n */\nvar LRUCache = function(capacity) {\n    \n};\n\n/** \n * @param {number} key\n * @return {number}\n */\nLRUCache.prototype.get = function(key) {\n    \n};\n\n/** \n * @param {number} key \n * @param {number} value\n * @return {void}\n */\nLRUCache.prototype.put = function(key, value) {\n    \n};"}'::jsonb
),
(
    'trapping-rain-water',
    'Trapping Rain Water',
    'Hard',
    28.9,
    '# Trapping Rain Water

Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.

**Example 1:**
```
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The above elevation map (black section) is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped.
```
',
    '{"python": "def trap(height: List[int]) -> int:\n    pass", "javascript": "/**\n * @param {number[]} height\n * @return {number}\n */\nvar trap = function(height) {\n    \n};"}'::jsonb
);
