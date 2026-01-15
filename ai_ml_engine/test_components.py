#!/usr/bin/env python3
"""
Test script for Medical AI Core components
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all components can be imported"""
    try:
        from inference.optimized_medicine_analyzer import OptimizedMedicineAnalyzer
        print("✓ OptimizedMedicineAnalyzer imported successfully")
        
        from local_llm_integration import LocalMedicalLLM
        print("✓ LocalMedicalLLM imported successfully")
        
        from medical_agents import MedicalAgentOrchestrator
        print("✓ MedicalAgentOrchestrator imported successfully")
        
        from caching_system import cache_manager
        print("✓ CacheManager imported successfully")
        
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False

def test_basic_functionality():
    """Test basic functionality of components"""
    try:
        # Test medicine analyzer
        from inference.optimized_medicine_analyzer import OptimizedMedicineAnalyzer, MedicineInfo
        analyzer = OptimizedMedicineAnalyzer()
        print("✓ Medicine analyzer instantiated")
        
        # Test basic analysis
        sample_text = "PARACETAMOL 500MG TABLETS"
        result = analyzer.analyze_medicine_from_text(sample_text)
        print(f"✓ Medicine analysis completed: {result.name}")
        
        # Verify result structure
        assert hasattr(result, 'name'), "MedicineInfo missing 'name' attribute"
        assert hasattr(result, 'uses'), "MedicineInfo missing 'uses' attribute"
        assert hasattr(result, 'side_effects'), "MedicineInfo missing 'side_effects' attribute"
        print("✓ MedicineInfo structure verified")
        
        # Test cache manager
        from caching_system import cache_manager
        cache_manager.cache_medicine_info("test_key", result)
        cached_result = cache_manager.get_cached_medicine_info("test_key")
        assert cached_result is not None, "Cache retrieval failed"
        print("✓ Caching system working")
        
        return True
    except Exception as e:
        print(f"✗ Functionality test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=== Medical AI Core Component Tests ===")
    
    print("\n1. Testing Imports:")
    if test_imports():
        print("✓ All imports successful")
    else:
        print("✗ Some imports failed")
        return
    
    print("\n2. Testing Basic Functionality:")
    if test_basic_functionality():
        print("✓ Basic functionality working")
    else:
        print("✗ Basic functionality failed")
        return
    
    print("\n=== All Tests Passed! ===")
    print("Medical AI Core is ready for use")

if __name__ == "__main__":
    main()