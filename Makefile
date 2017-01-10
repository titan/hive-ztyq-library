DISTDIR=dist
SRCDIR=src
CODE=index.js
TYPE=index.d.ts
DISTCODE=$(DISTDIR)/$(CODE)
DISTTYPE=$(DISTDIR)/$(TYPE)
SRC=$(SRCDIR)/index.ts

all: $(CODE) $(TYPE)

$(CODE): $(DISTCODE)
	mv $< $@

$(TYPE): $(DISTTYPE)
	mv $< $@

$(DISTCODE) $(DISTTYPE): $(SRC)
	tsc || rm $(DISTCODE) $(DISTTYPE)

clean:
	rm $(CODE)
	rm $(TYPE)
	rm -rf $(DISTDIR)

.PHONY: all clean
