"""
Caching System for Medical AI Assistant
Implements multiple caching strategies to optimize performance
"""

import time
import hashlib
import json
from typing import Any, Optional, Dict
from datetime import datetime, timedelta
from functools import wraps
import threading
import pickle
import os

class LRUCache:
    """
    Least Recently Used Cache implementation for medical data
    """
    
    def __init__(self, capacity: int = 1000, ttl: int = 3600):
        """
        Initialize LRU Cache
        
        Args:
            capacity: Maximum number of items to store
            ttl: Time to live in seconds
        """
        self.capacity = capacity
        self.ttl = ttl
        self.cache = {}
        self.access_times = {}
        self.lock = threading.Lock()
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found/expired
        """
        with self.lock:
            if key not in self.cache:
                return None
            
            # Check if expired
            if time.time() - self.access_times[key] > self.ttl:
                del self.cache[key]
                del self.access_times[key]
                return None
            
            # Update access time (LRU behavior)
            self.access_times[key] = time.time()
            return self.cache[key]
    
    def put(self, key: str, value: Any) -> None:
        """
        Put value in cache
        
        Args:
            key: Cache key
            value: Value to cache
        """
        with self.lock:
            # Check if we need to evict items
            if len(self.cache) >= self.capacity:
                # Find oldest accessed item
                oldest_key = min(self.access_times.keys(), 
                               key=lambda k: self.access_times[k])
                
                # Check if it's expired
                if time.time() - self.access_times[oldest_key] > self.ttl:
                    del self.cache[oldest_key]
                    del self.access_times[oldest_key]
            
            self.cache[key] = value
            self.access_times[key] = time.time()
    
    def delete(self, key: str) -> bool:
        """
        Delete item from cache
        
        Args:
            key: Cache key to delete
            
        Returns:
            True if item was deleted, False otherwise
        """
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                del self.access_times[key]
                return True
            return False
    
    def clear(self) -> None:
        """Clear all cache entries"""
        with self.lock:
            self.cache.clear()
            self.access_times.clear()

class MedicalCacheManager:
    """
    Comprehensive cache manager for medical AI application
    Handles different types of medical data with appropriate caching strategies
    """
    
    def __init__(self):
        # Different caches for different data types
        self.medicine_cache = LRUCache(capacity=500, ttl=7200)  # 2 hours for medicine info
        self.ocr_cache = LRUCache(capacity=1000, ttl=1800)      # 30 mins for OCR results
        self.llm_cache = LRUCache(capacity=200, ttl=3600)       # 1 hour for LLM responses
        self.agent_cache = LRUCache(capacity=300, ttl=3600)     # 1 hour for agent responses
        self.user_context_cache = LRUCache(capacity=1000, ttl=14400)  # 4 hours for user contexts
        
        self.stats = {
            'hits': 0,
            'misses': 0,
            'evictions': 0
        }
        self.stats_lock = threading.Lock()
    
    def _generate_cache_key(self, *args, **kwargs) -> str:
        """
        Generate a unique cache key from function arguments
        
        Args:
            *args: Positional arguments
            **kwargs: Keyword arguments
            
        Returns:
            Hashed string key
        """
        key_data = {
            'args': args,
            'kwargs': sorted(kwargs.items()) if kwargs else {}
        }
        key_str = json.dumps(key_data, sort_keys=True, default=str)
        return hashlib.sha256(key_str.encode()).hexdigest()
    
    def cache_medicine_info(self, medicine_name: str, info: Any) -> None:
        """Cache medicine information"""
        key = f"medicine:{medicine_name.lower()}"
        self.medicine_cache.put(key, info)
    
    def get_cached_medicine_info(self, medicine_name: str) -> Optional[Any]:
        """Get cached medicine information"""
        key = f"medicine:{medicine_name.lower()}"
        result = self.medicine_cache.get(key)
        if result is not None:
            with self.stats_lock:
                self.stats['hits'] += 1
        else:
            with self.stats_lock:
                self.stats['misses'] += 1
        return result
    
    def cache_ocr_result(self, image_hash: str, result: Any) -> None:
        """Cache OCR results"""
        key = f"ocr:{image_hash}"
        self.ocr_cache.put(key, result)
    
    def get_cached_ocr_result(self, image_hash: str) -> Optional[Any]:
        """Get cached OCR results"""
        key = f"ocr:{image_hash}"
        result = self.ocr_cache.get(key)
        if result is not None:
            with self.stats_lock:
                self.stats['hits'] += 1
        else:
            with self.stats_lock:
                self.stats['misses'] += 1
        return result
    
    def cache_llm_response(self, prompt_hash: str, response: Any) -> None:
        """Cache LLM responses"""
        key = f"llm:{prompt_hash}"
        self.llm_cache.put(key, response)
    
    def get_cached_llm_response(self, prompt_hash: str) -> Optional[Any]:
        """Get cached LLM response"""
        key = f"llm:{prompt_hash}"
        result = self.llm_cache.get(key)
        if result is not None:
            with self.stats_lock:
                self.stats['hits'] += 1
        else:
            with self.stats_lock:
                self.stats['misses'] += 1
        return result
    
    def cache_agent_response(self, query_hash: str, response: Any) -> None:
        """Cache agent responses"""
        key = f"agent:{query_hash}"
        self.agent_cache.put(key, response)
    
    def get_cached_agent_response(self, query_hash: str) -> Optional[Any]:
        """Get cached agent response"""
        key = f"agent:{query_hash}"
        result = self.agent_cache.get(key)
        if result is not None:
            with self.stats_lock:
                self.stats['hits'] += 1
        else:
            with self.stats_lock:
                self.stats['misses'] += 1
        return result
    
    def cache_user_context(self, user_id: str, context: Any) -> None:
        """Cache user context"""
        key = f"user:{user_id}"
        self.user_context_cache.put(key, context)
    
    def get_cached_user_context(self, user_id: str) -> Optional[Any]:
        """Get cached user context"""
        key = f"user:{user_id}"
        result = self.user_context_cache.get(key)
        if result is not None:
            with self.stats_lock:
                self.stats['hits'] += 1
        else:
            with self.stats_lock:
                self.stats['misses'] += 1
        return result
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self.stats_lock:
            total_requests = self.stats['hits'] + self.stats['misses']
            hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
            
            return {
                'total_requests': total_requests,
                'hits': self.stats['hits'],
                'misses': self.stats['misses'],
                'hit_rate_percent': round(hit_rate, 2),
                'cache_sizes': {
                    'medicine': len(self.medicine_cache.cache),
                    'ocr': len(self.ocr_cache.cache),
                    'llm': len(self.llm_cache.cache),
                    'agent': len(self.agent_cache.cache),
                    'user_context': len(self.user_context_cache.cache)
                }
            }
    
    def clear_all_caches(self) -> None:
        """Clear all caches"""
        self.medicine_cache.clear()
        self.ocr_cache.clear()
        self.llm_cache.clear()
        self.agent_cache.clear()
        self.user_context_cache.clear()
        
        with self.stats_lock:
            self.stats['evictions'] += sum([
                len(self.medicine_cache.cache),
                len(self.ocr_cache.cache),
                len(self.llm_cache.cache),
                len(self.agent_cache.cache),
                len(self.user_context_cache.cache)
            ])

def cache_memoize(ttl: int = 3600, cache_instance: MedicalCacheManager = None):
    """
    Decorator for function memoization with TTL
    
    Args:
        ttl: Time to live in seconds
        cache_instance: Cache manager instance
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            cache_key = f"{func.__name__}:{hash(str(args) + str(sorted(kwargs.items()))) % 1000000}"
            
            # Use provided cache instance or create a temporary one
            cache = cache_instance or getattr(wrapper, '_temp_cache', None)
            if cache is None:
                # Create a simple in-memory cache for this function
                if not hasattr(wrapper, '_temp_cache'):
                    setattr(wrapper, '_temp_cache', {})
                cache = wrapper._temp_cache
            
            # Check if result is in cache
            current_time = time.time()
            if cache_key in cache:
                result, timestamp = cache[cache_key]
                if current_time - timestamp < ttl:
                    return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache[cache_key] = (result, current_time)
            return result
        
        return wrapper
    return decorator

# Global cache manager instance
cache_manager = MedicalCacheManager()

# Example usage functions
def get_medicine_info_cached(medicine_name: str) -> Optional[Dict]:
    """
    Example function demonstrating cached medicine info retrieval
    """
    # Try to get from cache first
    cached_result = cache_manager.get_cached_medicine_info(medicine_name)
    if cached_result:
        print(f"Cache HIT for medicine: {medicine_name}")
        return cached_result
    
    # Simulate expensive operation (in real app, this would query database/API)
    print(f"Cache MISS for medicine: {medicine_name}, performing lookup...")
    time.sleep(0.1)  # Simulate processing time
    
    # Mock result - in real app, this would come from database
    result = {
        "name": medicine_name,
        "generic_name": "generic_" + medicine_name,
        "uses": ["use1", "use2"],
        "side_effects": ["effect1", "effect2"],
        "contraindications": ["contraindication1"],
        "timestamp": time.time()
    }
    
    # Cache the result
    cache_manager.cache_medicine_info(medicine_name, result)
    return result

def analyze_image_ocr_cached(image_path: str) -> Dict:
    """
    Example function demonstrating cached OCR analysis
    """
    # Generate hash of image path/content for cache key
    image_hash = hashlib.md5(image_path.encode()).hexdigest()
    
    # Try to get from cache first
    cached_result = cache_manager.get_cached_ocr_result(image_hash)
    if cached_result:
        print(f"Cache HIT for image: {image_path}")
        return cached_result
    
    # Simulate expensive OCR operation
    print(f"Cache MISS for image: {image_path}, performing OCR...")
    time.sleep(0.5)  # Simulate OCR processing time
    
    # Mock result
    result = {
        "text": "Simulated OCR result for " + image_path,
        "confidence": 95.0,
        "medicine_detected": "Paracetamol",
        "timestamp": time.time()
    }
    
    # Cache the result
    cache_manager.cache_ocr_result(image_hash, result)
    return result

if __name__ == "__main__":
    print("Testing Medical Cache Manager...")
    
    # Test medicine info caching
    print("\n1. Testing medicine info caching:")
    result1 = get_medicine_info_cached("paracetamol")
    print(f"First call result keys: {list(result1.keys())}")
    
    result2 = get_medicine_info_cached("paracetamol")  # Should be cached
    print(f"Second call (cached) - same result: {result1['name'] == result2['name']}")
    
    # Test OCR caching
    print("\n2. Testing OCR caching:")
    ocr1 = analyze_image_ocr_cached("/path/to/medicine/image.jpg")
    print(f"First OCR call timestamp: {ocr1['timestamp']}")
    
    ocr2 = analyze_image_ocr_cached("/path/to/medicine/image.jpg")  # Should be cached
    print(f"Second OCR call (cached) timestamp: {ocr2['timestamp']}")
    print(f"Same result from cache: {ocr1['text'] == ocr2['text']}")
    
    # Show cache statistics
    print("\n3. Cache Statistics:")
    stats = cache_manager.get_stats()
    print(json.dumps(stats, indent=2))