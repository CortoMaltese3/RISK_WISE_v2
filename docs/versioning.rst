Versioning & Release Workflow
=============================

This guide covers best practices for tagging releases, maintaining a changelog, and keeping your README up-to-date.

Semantic Versioning
-------------------
We follow `Semantic Versioning <https://semver.org/>`_:

- **MAJOR** version when you make incompatible API changes  
- **MINOR** version when you add functionality in a backwards-compatible manner  
- **PATCH** version when you make backwards-compatible bug fixes  

Tagging a Release
-----------------
1. **Bump version** in your code or `pyproject.toml` / `__version__`.  
2. **Prepare `CHANGELOG.md`** with an entry under the new version header.  
3. **Commit** any changes:

   .. code-block:: bash

      git add CHANGELOG.md src/your_module/__init__.py
      git commit -m "Prepare release v1.2.0"

4. **Create an annotated tag**:

   .. code-block:: bash

      git tag -a v1.2.0 -m $'Release v1.2.0

      ### Added
      - Feature X
      - Endpoint Y

      ### Fixed
      - Bug in Z
      '

5. **Push tag** to origin:

   .. code-block:: bash

      git push origin v1.2.0

6. **Draft a GitHub Release** (optional) and copy your tag message.

Maintaining CHANGELOG.md
------------------------
Use the `Keep a Changelog <https://keepachangelog.com/>`_ format:

.. code-block:: text

   # Changelog

   ## [1.2.0] - 2025-07-15
   ### Added
   - Feature X
   - Endpoint Y

   ### Fixed
   - Bug in Z
